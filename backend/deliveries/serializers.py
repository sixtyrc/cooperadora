from rest_framework import serializers
from .models import Delivery


class DeliverySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    order_code = serializers.CharField(source='order.code', read_only=True)

    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ['user', 'delivered_at']

    def create(self, validated_data):
        # Asignar usuario logueado
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user'] = request.user
        return super().create(validated_data)
