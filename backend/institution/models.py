from django.db import models
from django.core.exceptions import ValidationError

class Institution(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#22C55E', help_text="Formato HEX, ej: #22C55E")
    secondary_color = models.CharField(max_length=7, default='#16A34A', help_text="Formato HEX")
    phone = models.CharField(max_length=50, blank=True)
    whatsapp = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=255, blank=True)
    social_links = models.JSONField(default=dict, blank=True, help_text="JSON con enlaces a redes sociales")
    welcome_message = models.TextField(blank=True, verbose_name="Mensaje de bienvenida")

    def save(self, *args, **kwargs):
        if not self.pk and Institution.objects.exists():
            # Solo permitir una institución
            raise ValidationError("Solo puede existir una configuración institucional.")
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name
