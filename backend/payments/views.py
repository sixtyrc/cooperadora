from datetime import datetime

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import ScopedRateThrottle
from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, PaymentAdminSerializer
from orders.payment_pdf import generate_payment_pdf
from .ocr_utils import extract_voucher_data
from accounts.audit import log_action


def _parse_date(value):
    if not value:
        return None
    try:
        return timezone.make_aware(datetime.strptime(value, "%Y-%m-%d"))
    except ValueError:
        return None


class PaymentCreateView(generics.CreateAPIView):
    """POST /api/payments — público, adjunta comprobante a un pedido."""
    serializer_class = PaymentSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes_override = None  # Acepta multipart/form-data automáticamente

    def perform_create(self, serializer):
        payment = serializer.save()
        # Si el pago es en efectivo, marcar pedido como pendiente_pago
        if payment.method == Payment.METHOD_CASH:
            Order.objects.filter(pk=payment.order.pk, status=Order.STATUS_PENDING).update(
                status=Order.STATUS_PENDING_PAYMENT
            )
        # Si es transferencia, también pasa a pendiente_pago hasta verificar
        elif payment.method == Payment.METHOD_TRANSFER:
            Order.objects.filter(pk=payment.order.pk, status=Order.STATUS_PENDING).update(
                status=Order.STATUS_PENDING_PAYMENT
            )


class PaymentAdminListView(generics.ListAPIView):
    """GET /api/admin/payments — backoffice, todos los pagos con filtros."""
    serializer_class = PaymentAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Payment.objects.select_related('order').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        reconciliation = self.request.query_params.get('reconciliation')
        campaign = self.request.query_params.get('campaign')
        date_from = _parse_date(self.request.query_params.get('date_from'))
        date_to = _parse_date(self.request.query_params.get('date_to'))

        if status_filter:
            qs = qs.filter(status=status_filter)
        if reconciliation:
            qs = qs.filter(reconciliation_status=reconciliation)
        if campaign:
            qs = qs.filter(order__campaign__slug=campaign)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from.date())
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to.date())
        return qs


class PaymentAdminDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/admin/payments/<id> — verificar o rechazar comprobante."""
    serializer_class = PaymentAdminSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Payment.objects.select_related('order')

    def perform_update(self, serializer):
        payment = serializer.save()
        user = self.request.user
        if payment.status == Payment.STATUS_VERIFIED:
            Order.objects.filter(pk=payment.order.pk).update(status=Order.STATUS_PAID)
            log_action(user, 'pago_verificado',
                       f'Verificó pago #{payment.id} del pedido {payment.order.code} — ${payment.order.total}',
                       self.request)
        elif payment.status == Payment.STATUS_REJECTED:
            Order.objects.filter(pk=payment.order.pk).update(status=Order.STATUS_PENDING)
            log_action(user, 'pago_rechazado',
                       f'Rechazó pago #{payment.id} del pedido {payment.order.code}',
                       self.request)


class PaymentPdfView(generics.GenericAPIView):
    """GET /api/payments/<id>/pdf — descargar comprobante de carga de pago."""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Payment.objects.select_related('order')

    def get(self, request, pk):
        try:
            payment = Payment.objects.select_related('order').get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'detail': 'Pago no encontrado'}, status=404)
        buf = generate_payment_pdf(payment.order, payment)
        response = HttpResponse(buf, content_type='application/pdf')
        filename = f"comprobante-{payment.order.code}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class PaymentOcrView(generics.GenericAPIView):
    """POST /api/payments/ocr — lee datos de un comprobante bancario con OCR."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ocr'

    def post(self, request):
        file = request.FILES.get('voucher')
        if not file:
            return Response({'detail': 'Adjuntá un archivo (jpg, png).'}, status=400)
        if file.size > 5 * 1024 * 1024:
            return Response({'detail': 'El archivo supera los 5 MB.'}, status=400)
        try:
            data = extract_voucher_data(file)
        except Exception:
            return Response({'detail': 'No se pudo leer el comprobante.'}, status=400)
        return Response(data)
