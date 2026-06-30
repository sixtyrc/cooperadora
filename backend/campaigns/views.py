from rest_framework import generics, permissions
from .models import Campaign
from .serializers import CampaignSerializer, CampaignPublicSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin()


class CampaignListPublicView(generics.ListAPIView):
    """GET /api/campaigns — solo campañas visibles, sin autenticación."""
    serializer_class = CampaignPublicSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return [c for c in Campaign.objects.filter(is_active=True, status='active') if c.is_visible]


class CampaignDetailPublicView(generics.RetrieveAPIView):
    """GET /api/campaigns/<slug> — detalle público."""
    serializer_class = CampaignPublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Campaign.objects.filter(is_active=True, status='active')


# --- Admin ---

class CampaignAdminListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/campaigns — admin ve todas."""
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Campaign.objects.all().order_by('-created_at')


class CampaignAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/admin/campaigns/<id>"""
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Campaign.objects.all()
