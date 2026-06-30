from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Institution
from .serializers import InstitutionSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin()

class InstitutionView(generics.RetrieveUpdateAPIView):
    serializer_class = InstitutionSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self):
        obj, created = Institution.objects.get_or_create(
            defaults={
                'name': 'Cooperadora Online',
                'welcome_message': 'Bienvenidos al sistema'
            }
        )
        return obj
