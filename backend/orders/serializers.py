from rest_framework import serializers
from products.serializers import ProductPublicSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_detail = ProductPublicSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'unit_price', 'subtotal']
        read_only_fields = ['unit_price', 'subtotal']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Usado por el público al crear un pedido."""
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'campaign', 'customer_name', 'phone',
            'student_name', 'classroom', 'notes', 'items'
        ]

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("El pedido debe tener al menos un ítem.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data['product']
            qty = item_data.get('quantity', 1)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                unit_price=product.price,
            )
        return order


class OrderSerializer(serializers.ModelSerializer):
    """Serialización completa para admin y consulta."""
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
