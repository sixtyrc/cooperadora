from rest_framework import serializers
from .models import Payment

ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class PaymentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

    def validate_voucher(self, value):
        if not value:
            return value
        # Validar tamaño
        if value.size > MAX_FILE_SIZE:
            raise serializers.ValidationError("El comprobante no puede superar los 5 MB.")
        # Validar extensión
        ext = value.name.rsplit('.', 1)[-1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Formato no permitido. Usar: {', '.join(ALLOWED_EXTENSIONS).upper()}"
            )
        return value


class PaymentAdminSerializer(serializers.ModelSerializer):
    """Para el backoffice, permite cambiar estado."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
