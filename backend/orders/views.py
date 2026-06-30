from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer


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


class OrderAdminListView(generics.ListAPIView):
    """GET /api/admin/orders — lista completa para backoffice."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.prefetch_related('items__product').order_by('-created_at')


class OrderAdminDetailView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/admin/orders/<id> — actualizar estado."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.prefetch_related('items__product')
