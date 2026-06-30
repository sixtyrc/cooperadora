from django.db import models
from django.conf import settings
from orders.models import Order


class Delivery(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='delivery'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='deliveries'
    )
    delivered_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Cambiar el estado del pedido a entregado
        if self.order.status != Order.STATUS_DELIVERED:
            Order.objects.filter(pk=self.order.pk).update(status=Order.STATUS_DELIVERED)

    def __str__(self):
        return f"Entrega del pedido {self.order.code}"
