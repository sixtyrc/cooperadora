from rest_framework import generics, permissions
from orders.models import Order
from .models import Payment
from .serializers import PaymentSerializer, PaymentAdminSerializer


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
    """GET /api/admin/payments — backoffice, todos los pagos."""
    serializer_class = PaymentAdminSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Payment.objects.select_related('order').order_by('-created_at')


class PaymentAdminDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/admin/payments/<id> — verificar o rechazar comprobante."""
    serializer_class = PaymentAdminSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Payment.objects.select_related('order')

    def perform_update(self, serializer):
        payment = serializer.save()
        # Si se verifica el pago, actualizar estado del pedido
        if payment.status == Payment.STATUS_VERIFIED:
            Order.objects.filter(pk=payment.order.pk).update(status=Order.STATUS_PAID)
        elif payment.status == Payment.STATUS_REJECTED:
            Order.objects.filter(pk=payment.order.pk).update(status=Order.STATUS_PENDING)
