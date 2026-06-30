from django.db import transaction
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
        if len(value) > 30:
            raise serializers.ValidationError("El pedido no puede superar los 30 productos.")
        product_ids = [item['product'].pk for item in value]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError("No repitas productos; aumentá la cantidad.")
        for item in value:
            if item.get('quantity', 1) < 1 or item.get('quantity', 1) > 99:
                raise serializers.ValidationError("La cantidad debe estar entre 1 y 99.")
        return value

    def validate(self, attrs):
        campaign = attrs['campaign']
        if not campaign.is_visible:
            raise serializers.ValidationError(
                {'campaign': 'Esta campaña no está disponible para recibir pedidos.'}
            )
        for item in attrs.get('items', []):
            product = item['product']
            if product.campaign_id != campaign.pk or not product.is_active:
                raise serializers.ValidationError(
                    {'items': f'El producto "{product.name}" no está disponible en esta campaña.'}
                )
        return attrs

    @transaction.atomic
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
        read_only_fields = [
            'id', 'code', 'campaign', 'customer_name', 'phone', 'student_name',
            'classroom', 'notes', 'total', 'created_at', 'updated_at',
        ]

    def validate_phone(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "Ingresá 10 números, sin espacios ni guiones. Ejemplo: 3624617500."
            )
        return value


class OrderDeliveryCheckSerializer(serializers.ModelSerializer):
    """Serializer ligero para checklist de entregas."""
    is_delivered = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'code', 'customer_name', 'student_name', 'classroom', 'status', 'status_display', 'is_delivered']

    def get_is_delivered(self, obj):
        return hasattr(obj, 'delivery')
