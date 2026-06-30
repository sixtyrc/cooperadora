from rest_framework import permissions


class IsAdminOrOperator(permissions.BasePermission):
    """Permite acceso a administradores y operadores."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_admin() or user.is_operator())
        )
