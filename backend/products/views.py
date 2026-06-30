from rest_framework import generics, permissions
from .models import Product
from .serializers import ProductSerializer, ProductPublicSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin()


class ProductPublicByCampaignView(generics.ListAPIView):
    """GET /api/campaigns/<slug>/products — productos activos de una campaña."""
    serializer_class = ProductPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            campaign__slug=self.kwargs['slug'],
            campaign__is_active=True,
            is_active=True
        )


class ProductAdminListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Product.objects.all().order_by('campaign', 'order')


class ProductAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Product.objects.all()
