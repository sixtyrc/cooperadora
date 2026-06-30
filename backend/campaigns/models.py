from django.db import models
from django.utils import timezone
from django.utils.text import slugify
import io
from PIL import Image as PILImage
from django.core.files.base import ContentFile


def compress_image(image_field, max_size=(1200, 1200), quality=80):
    """Comprime la imagen al guardar, manteniendo calidad visual aceptable."""
    if not image_field:
        return
    img = PILImage.open(image_field)
    if img.mode in ('RGBA', 'P'):
        img = img.convert('RGB')
    img.thumbnail(max_size, PILImage.LANCZOS)
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG', quality=quality, optimize=True)
    buffer.seek(0)
    return buffer


class Campaign(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_ACTIVE = 'active'
    STATUS_FINISHED = 'finished'
    STATUS_ARCHIVED = 'archived'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Borrador'),
        (STATUS_ACTIVE, 'Activa'),
        (STATUS_FINISHED, 'Finalizada'),
        (STATUS_ARCHIVED, 'Archivada'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='campaigns/', null=True, blank=True)
    color = models.CharField(max_length=7, default='#22C55E')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Comprimir imagen
        if self.image and hasattr(self.image, 'file'):
            try:
                buf = compress_image(self.image)
                if buf:
                    fname = self.image.name.rsplit('.', 1)[0] + '.jpg'
                    self.image.save(fname, ContentFile(buf.read()), save=False)
            except Exception:
                pass
        super().save(*args, **kwargs)

    @property
    def is_visible(self):
        today = timezone.now().date()
        return (
            self.is_active
            and self.status == self.STATUS_ACTIVE
            and (self.start_date is None or self.start_date <= today)
            and (self.end_date is None or self.end_date >= today)
        )

    def __str__(self):
        return self.name
