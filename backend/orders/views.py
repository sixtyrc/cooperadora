from datetime import datetime

from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, OrderDeliveryCheckSerializer
from .pdf_utils import generate_order_pdf
from accounts.audit import log_action


class OrderCreateView(generics.CreateAPIView):
    """POST /api/orders — público, sin autenticación."""
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            {"code": order.code, "total": str(order.total)},
            status=status.HTTP_201_CREATED
        )


class OrderQueryView(generics.RetrieveAPIView):
    """GET /api/orders/<code> — consulta pública por código."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'code'
    queryset = Order.objects.prefetch_related('items__product')

    def get_object(self):
        order = super().get_object()
        phone = ''.join(filter(str.isdigit, self.request.query_params.get('phone', '')))
        stored_phone = ''.join(filter(str.isdigit, order.phone))
        if len(phone) < 6 or phone != stored_phone:
            from rest_framework.exceptions import NotFound
            raise NotFound('Pedido no encontrado. Revisá el código y el teléfono.')
        return order


def _parse_date(value):
    if not value:
        return None
    try:
        return timezone.make_aware(datetime.strptime(value, "%Y-%m-%d"))
    except ValueError:
        return None


class OrderAdminListView(generics.ListAPIView):
    """GET /api/admin/orders — lista completa para backoffice con filtros."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Order.objects.prefetch_related('items__product').order_by('-created_at')
        status_filter = self.request.query_params.get('status')
        campaign = self.request.query_params.get('campaign')
        date_from = _parse_date(self.request.query_params.get('date_from'))
        date_to = _parse_date(self.request.query_params.get('date_to'))

        if status_filter:
            qs = qs.filter(status=status_filter)
        if campaign:
            qs = qs.filter(campaign__slug=campaign)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from.date())
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to.date())
        return qs


class OrderAdminDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/admin/orders/<id> — actualizar estado."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.prefetch_related('items__product')

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        order = serializer.save()
        new_status = order.status
        if old_status != new_status:
            log_action(
                self.request.user,
                'pedido_estado_cambiado',
                f'Pedido {order.code}: {old_status} → {new_status}',
                self.request,
            )


class OrderPdfView(APIView):
    """GET /api/orders/<code>/pdf — descargar PDF del pedido."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        try:
            order = Order.objects.prefetch_related('items__product').get(code=code)
        except Order.DoesNotExist:
            return Response({'detail': 'Pedido no encontrado'}, status=404)
        phone = ''.join(filter(str.isdigit, request.query_params.get('phone', '')))
        if len(phone) < 6 or phone != ''.join(filter(str.isdigit, order.phone)):
            return Response({'detail': 'Pedido no encontrado'}, status=404)
        buf = generate_order_pdf(order)
        response = HttpResponse(buf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{order.code}.pdf"'
        return response


class OrderDeliveryCheckView(APIView):
    """GET /api/admin/orders/delivery-check?campaign=<slug> — grilla de entregas.
    PATCH /api/admin/orders/delivery-check — toggle entrega."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        campaign = request.query_params.get('campaign')
        qs = Order.objects.select_related('delivery').order_by('customer_name')
        if campaign:
            qs = qs.filter(campaign__slug=campaign)
        # Solo pedidos pagados o entregados
        qs = qs.filter(status__in=[Order.STATUS_PAID, Order.STATUS_DELIVERED])
        serializer = OrderDeliveryCheckSerializer(qs, many=True)
        return Response(serializer.data)

    def patch(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'detail': 'order_id requerido'}, status=400)
        try:
            order = Order.objects.get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Pedido no encontrado'}, status=404)
        if order.status not in [Order.STATUS_PAID, Order.STATUS_DELIVERED]:
            return Response({'detail': 'Solo se pueden entregar pedidos pagados.'}, status=400)

        from deliveries.models import Delivery
        delivery_exists = Delivery.objects.filter(order=order).exists()

        if delivery_exists:
            # Quitar entrega
            Delivery.objects.filter(order=order).delete()
            Order.objects.filter(pk=order.pk).update(status=Order.STATUS_PAID)
            log_action(request.user, 'entrega_desmarcada',
                       f'Desmarcó entrega del pedido {order.code} ({order.customer_name})',
                       request)
            return Response({'delivered': False})
        else:
            # Marcar como entregado
            Delivery.objects.create(order=order, user=request.user)
            log_action(request.user, 'entrega_marcada',
                       f'Marcó como entregado el pedido {order.code} ({order.customer_name})',
                       request)
            return Response({'delivered': True})
