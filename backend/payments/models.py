import uuid
import os
from io import BytesIO
from django.db import models
from django.core.files.base import ContentFile
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
    # Datos OCR extraídos del comprobante
    ocr_name = models.CharField(max_length=200, blank=True, help_text='Nombre del titular del comprobante')
    ocr_dni = models.CharField(max_length=20, blank=True, help_text='DNI o CUIL detectado')
    ocr_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, help_text='Monto detectado en comprobante')
    ocr_date = models.CharField(max_length=50, blank=True, help_text='Fecha detectada en comprobante')
    ocr_operation_id = models.CharField(max_length=50, blank=True, help_text='Nro de operación detectado')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.order.code} — {self.get_method_display()}"

    def save(self, *args, **kwargs):
        # Comprimir imágenes antes de guardar
        if self.voucher and hasattr(self.voucher, 'read'):
            from PIL import Image as PILImage
            ext = self.voucher.name.rsplit('.', 1)[-1].lower()
            if ext in ('jpg', 'jpeg', 'png'):
                try:
                    img = PILImage.open(self.voucher)
                    # Reducir tamaño máximo a 1200px de ancho
                    max_width = 1200
                    if img.width > max_width:
                        ratio = max_width / img.width
                        img = img.resize((max_width, int(img.height * ratio)), PILImage.LANCZOS)
                    # Convertir a RGB si tiene canal alfa
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    # Guardar con compresión
                    buf = BytesIO()
                    img.save(buf, format='JPEG', quality=75, optimize=True)
                    new_name = self.voucher.name.rsplit('.', 1)[0] + '.jpg'
                    self.voucher.save(new_name, ContentFile(buf.getvalue()), save=False)
                except Exception:
                    pass  # Si falla, guardar original
        super().save(*args, **kwargs)
