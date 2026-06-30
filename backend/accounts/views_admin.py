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


class AuditLogListView(generics.ListAPIView):
    """GET /api/admin/audit"""
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    queryset = AuditLog.objects.select_related('user').order_by('-created_at')[:500]
