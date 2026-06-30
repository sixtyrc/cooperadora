import hashlib
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers
from .models import Payment

ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class PaymentSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

    def validate(self, attrs):
        order = attrs['order']
        phone = ''.join(filter(str.isdigit, attrs.pop('phone', '')))
        if len(phone) < 6 or phone != ''.join(filter(str.isdigit, order.phone)):
            raise serializers.ValidationError({'order': 'Pedido no encontrado.'})
        if order.status in [order.STATUS_PAID, order.STATUS_DELIVERED, order.STATUS_CANCELLED]:
            raise serializers.ValidationError({'order': 'Este pedido no admite nuevos pagos.'})
        if Payment.objects.filter(order=order, status=Payment.STATUS_PENDING).exists():
            raise serializers.ValidationError({'order': 'Ya existe un pago pendiente de verificación.'})
        if attrs.get('method') == Payment.METHOD_TRANSFER and not attrs.get('voucher'):
            raise serializers.ValidationError({'voucher': 'Adjuntá el comprobante.'})
        if attrs.get('method') == Payment.METHOD_CASH:
            attrs['voucher'] = None
        return attrs

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
        try:
            if ext == 'pdf':
                header = value.read(5)
                value.seek(0)
                if header != b'%PDF-':
                    raise serializers.ValidationError("El archivo no es un PDF válido.")
            else:
                image = Image.open(value)
                image.verify()
                value.seek(0)
        except (UnidentifiedImageError, OSError):
            raise serializers.ValidationError("El archivo no es una imagen válida.")
        return value

    def create(self, validated_data):
        """El OCR se ejecuta siempre en servidor para facilitar la conciliación."""
        voucher = validated_data.get('voucher')
        if voucher and validated_data.get('method') == Payment.METHOD_TRANSFER:
            digest = hashlib.sha256()
            for chunk in voucher.chunks():
                digest.update(chunk)
            validated_data['voucher_hash'] = digest.hexdigest()
            try:
                from .ocr_utils import extract_voucher_data

                voucher.seek(0)
                ocr = extract_voucher_data(voucher)
                voucher.seek(0)
                validated_data.update({
                    'ocr_name': ocr.get('name') or '',
                    'ocr_dni': ocr.get('dni') or '',
                    'ocr_amount': ocr.get('amount') or None,
                    'ocr_date': ocr.get('date') or '',
                    'ocr_operation_id': ocr.get('operation_id') or '',
                })
            except Exception:
                voucher.seek(0)
        payment = super().create(validated_data)
        payment.reconcile()
        return payment


class PaymentAdminSerializer(serializers.ModelSerializer):
    """Para el backoffice, permite cambiar estado."""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    order_code = serializers.CharField(source='order.code', read_only=True)
    order_total = serializers.DecimalField(source='order.total', max_digits=10, decimal_places=2, read_only=True)
    reconciliation_display = serializers.CharField(source='get_reconciliation_status_display', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = [
            field.name for field in Payment._meta.fields
            if field.name not in ('status', 'notes')
        ]
