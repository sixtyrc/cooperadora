from django.db import models
from django.utils import timezone
from campaigns.models import Campaign
from products.models import Product


def generate_order_code():
    year = timezone.now().year
    prefix = f"COOP-{year}-"
    last = Order.objects.filter(code__startswith=prefix).order_by('-code').first()
    if last:
        try:
            last_num = int(last.code.split('-')[-1])
        except ValueError:
            last_num = 0
    else:
        last_num = 0
    return f"{prefix}{str(last_num + 1).zfill(6)}"


class Order(models.Model):
    STATUS_PENDING = 'pendiente'
    STATUS_PENDING_PAYMENT = 'pendiente_pago'
    STATUS_PAID = 'pagado'
    STATUS_DELIVERED = 'entregado'
    STATUS_CANCELLED = 'cancelado'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pendiente'),
        (STATUS_PENDING_PAYMENT, 'Verificando Pago'),
        (STATUS_PAID, 'Pagado'),
        (STATUS_DELIVERED, 'Entregado'),
        (STATUS_CANCELLED, 'Cancelado'),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.PROTECT, related_name='orders')
    code = models.CharField(max_length=20, unique=True, blank=True, db_index=True)
    customer_name = models.CharField(max_length=255, verbose_name="Nombre del padre/madre")
    phone = models.CharField(max_length=50)
    student_name = models.CharField(max_length=255, verbose_name="Nombre del alumno/a")
    classroom = models.CharField(max_length=100, verbose_name="Sala")
    notes = models.TextField(blank=True, verbose_name="Observaciones")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = generate_order_code()
        super().save(*args, **kwargs)

    def recalculate_total(self):
        """Recalcula el total sumando todos los ítems."""
        from django.db.models import Sum
        result = self.items.aggregate(total=Sum('subtotal'))['total']
        self.total = result or 0
        Order.objects.filter(pk=self.pk).update(total=self.total)

    def __str__(self):
        return f"{self.code} — {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        # Capturar precio al momento del pedido
        if not self.unit_price:
            self.unit_price = self.product.price
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        # Recalcular total del pedido
        self.order.recalculate_total()

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
