from datetime import datetime

from django.utils import timezone
from rest_framework import generics, permissions
from .models import Delivery
from .serializers import DeliverySerializer
from accounts.audit import log_action


def _parse_date(value):
    if not value:
        return None
    try:
        return timezone.make_aware(datetime.strptime(value, "%Y-%m-%d"))
    except ValueError:
        return None


class DeliveryAdminListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/deliveries — para registrar una entrega."""
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        delivery = serializer.save(user=self.request.user)
        log_action(self.request.user, 'entrega_registrada',
                   f'Entregó pedido {delivery.order.code} a {delivery.order.customer_name}',
                   self.request)

    def get_queryset(self):
        qs = Delivery.objects.select_related('order', 'user').order_by('-delivered_at')
        campaign = self.request.query_params.get('campaign')
        date_from = _parse_date(self.request.query_params.get('date_from'))
        date_to = _parse_date(self.request.query_params.get('date_to'))

        if campaign:
            qs = qs.filter(order__campaign__slug=campaign)
        if date_from:
            qs = qs.filter(delivered_at__date__gte=date_from.date())
        if date_to:
            qs = qs.filter(delivered_at__date__lte=date_to.date())
        return qs


class DeliveryAdminDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Delivery.objects.all()
