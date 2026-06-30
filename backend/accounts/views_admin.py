from datetime import datetime

from django.utils import timezone
from rest_framework import generics, permissions
from .models import User, AuditLog
from .serializers import UserSerializer, UserCreateSerializer, AuditLogSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin()
        )


class UserAdminListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/admin/users"""
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    queryset = User.objects.all().order_by('-date_joined')


class UserAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/admin/users/<id>"""
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    queryset = User.objects.all()


def _parse_date(value):
    if not value:
        return None
    try:
        return timezone.make_aware(datetime.strptime(value, "%Y-%m-%d"))
    except ValueError:
        return None


class AuditLogListView(generics.ListAPIView):
    """GET /api/admin/audit — con filtros de fecha y usuario."""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = AuditLog.objects.select_related('user').order_by('-created_at')[:500]
        date_from = _parse_date(self.request.query_params.get('date_from'))
        date_to = _parse_date(self.request.query_params.get('date_to'))
        user_filter = self.request.query_params.get('user')
        action_filter = self.request.query_params.get('action')

        # Apply filters to the base queryset (before slicing)
        base_qs = AuditLog.objects.select_related('user').order_by('-created_at')
        if date_from:
            base_qs = base_qs.filter(created_at__date__gte=date_from.date())
        if date_to:
            base_qs = base_qs.filter(created_at__date__lte=date_to.date())
        if user_filter:
            base_qs = base_qs.filter(user__username=user_filter)
        if action_filter:
            base_qs = base_qs.filter(action=action_filter)
        return base_qs[:500]
