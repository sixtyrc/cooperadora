import uuid
import os
from django.db import models
from orders.models import Order


def voucher_upload_path(instance, filename):
    """Renombra el archivo a UUID + extensión original."""
    ext = filename.rsplit('.', 1)[-1].lower()
    return f"payments/{uuid.uuid4().hex}.{ext}"


class Payment(models.Model):
    METHOD_TRANSFER = 'transferencia'
    METHOD_CASH = 'efectivo'
    METHOD_CHOICES = [
        (METHOD_TRANSFER, 'Transferencia'),
        (METHOD_CASH, 'Efectivo'),
    ]

    STATUS_PENDING = 'pendiente'
    STATUS_VERIFIED = 'verificado'
    STATUS_REJECTED = 'rechazado'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente de verificación'),
        (STATUS_VERIFIED, 'Verificado'),
        (STATUS_REJECTED, 'Rechazado'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    voucher = models.FileField(upload_to=voucher_upload_path, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.order.code} — {self.get_method_display()}"
