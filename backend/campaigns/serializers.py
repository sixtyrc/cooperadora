from rest_framework import serializers
from .models import Campaign

class CampaignSerializer(serializers.ModelSerializer):
    is_visible = serializers.ReadOnlyField()

    class Meta:
        model = Campaign
        fields = '__all__'
        extra_kwargs = {
            'status': {'required': False},
            'is_active': {'required': False},
        }

    def validate_status(self, value):
        valid = [c[0] for c in Campaign.STATUS_CHOICES]
        if value not in valid:
            raise serializers.ValidationError(f"Status inválido. Opciones: {', '.join(valid)}")
        return value

class CampaignPublicSerializer(serializers.ModelSerializer):
    """Solo campos públicos para visitantes."""
    is_visible = serializers.ReadOnlyField()

    class Meta:
        model = Campaign
        fields = ['id', 'name', 'slug', 'description', 'image', 'color',
                  'start_date', 'end_date', 'is_visible']
