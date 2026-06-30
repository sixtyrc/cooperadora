from .models import AuditLog


def log_action(user, action, details='', request=None):
    """Registra una acción en el log de auditoría."""
    ip = None
    if request:
        xff = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')
    AuditLog.objects.create(
        user=user,
        action=action,
        details=details,
        ip_address=ip,
    )
