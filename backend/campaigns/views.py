from rest_framework import generics, permissions
from .models import Campaign
from .serializers import CampaignSerializer, CampaignPublicSerializer
from accounts.audit import log_action


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

    def perform_create(self, serializer):
        campaign = serializer.save()
        log_action(self.request.user, 'campana_creada',
                   f'Creó campaña "{campaign.name}"', self.request)


class CampaignAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/admin/campaigns/<id>"""
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Campaign.objects.all()

    def perform_update(self, serializer):
        campaign = serializer.save()
        log_action(self.request.user, 'campana_editada',
                   f'Editó campaña "{campaign.name}"', self.request)

    def perform_destroy(self, instance):
        name = instance.name
        instance.delete()
        log_action(self.request.user, 'campana_eliminada',
                   f'Eliminó campaña "{name}"', self.request)
