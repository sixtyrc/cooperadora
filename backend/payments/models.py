import uuid
import os
import hashlib
from decimal import Decimal
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
    RECONCILIATION_MATCHED = 'conciliado'
    RECONCILIATION_MISMATCH = 'monto_diferente'
    RECONCILIATION_DUPLICATE = 'duplicado'
    RECONCILIATION_INCOMPLETE = 'sin_datos'
    RECONCILIATION_MANUAL = 'manual'
    RECONCILIATION_CHOICES = [
        (RECONCILIATION_MATCHED, 'Conciliado'),
        (RECONCILIATION_MISMATCH, 'Monto diferente'),
        (RECONCILIATION_DUPLICATE, 'Posible duplicado'),
        (RECONCILIATION_INCOMPLETE, 'Datos insuficientes'),
        (RECONCILIATION_MANUAL, 'Control manual'),
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
    voucher_hash = models.CharField(max_length=64, blank=True, db_index=True, editable=False)
    reconciliation_status = models.CharField(
        max_length=20, choices=RECONCILIATION_CHOICES,
        default=RECONCILIATION_INCOMPLETE, db_index=True,
    )
    reconciliation_issues = models.JSONField(default=list, blank=True)
    duplicate_of = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL,
        related_name='duplicates', editable=False,
    )
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

    def reconcile(self):
        issues = []
        duplicate = None
        if not self.voucher_hash and self.voucher:
            try:
                digest = hashlib.sha256()
                self.voucher.open('rb')
                for chunk in self.voucher.chunks():
                    digest.update(chunk)
                self.voucher.close()
                self.voucher_hash = digest.hexdigest()
                Payment.objects.filter(pk=self.pk).update(voucher_hash=self.voucher_hash)
            except OSError:
                issues.append('No se pudo calcular la huella del archivo.')
        if self.method == self.METHOD_CASH:
            reconciliation = self.RECONCILIATION_MANUAL
            issues.append('Pago en efectivo: requiere control manual.')
        else:
            candidates = Payment.objects.exclude(pk=self.pk).filter(method=self.METHOD_TRANSFER)
            if self.voucher_hash:
                duplicate = candidates.filter(voucher_hash=self.voucher_hash).first()
            if not duplicate and self.ocr_operation_id:
                duplicate = candidates.filter(
                    ocr_operation_id__iexact=self.ocr_operation_id.strip()
                ).first()
            if duplicate:
                reconciliation = self.RECONCILIATION_DUPLICATE
                issues.append(f'Coincide con el pago #{duplicate.pk}.')
            elif self.ocr_amount is None:
                reconciliation = self.RECONCILIATION_INCOMPLETE
                issues.append('No se pudo detectar el monto.')
            elif Decimal(self.ocr_amount) != Decimal(self.order.total):
                reconciliation = self.RECONCILIATION_MISMATCH
                issues.append(
                    f'Monto detectado ${self.ocr_amount} distinto del pedido ${self.order.total}.'
                )
            else:
                reconciliation = self.RECONCILIATION_MATCHED
            if not self.ocr_operation_id:
                issues.append('No se detectó número de operación.')

        Payment.objects.filter(pk=self.pk).update(
            reconciliation_status=reconciliation,
            reconciliation_issues=issues,
            duplicate_of=duplicate,
        )
        self.reconciliation_status = reconciliation
        self.reconciliation_issues = issues
        self.duplicate_of = duplicate
        return reconciliation
