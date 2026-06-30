from rest_framework import generics, permissions
from .models import Delivery
from .serializers import DeliverySerializer


class DeliveryAdminListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/deliveries — para registrar una entrega."""
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Delivery.objects.select_related('order', 'user').order_by('-delivered_at')


class DeliveryAdminDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeliverySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Delivery.objects.all()
