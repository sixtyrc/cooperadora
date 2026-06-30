from django.db import models
from campaigns.models import Campaign, compress_image
from django.core.files.base import ContentFile


class Product(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Orden de visualización")
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
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

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.campaign.name} — {self.name}"
