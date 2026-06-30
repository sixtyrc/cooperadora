from rest_framework import serializers
from .models import Campaign

class CampaignSerializer(serializers.ModelSerializer):
    is_visible = serializers.ReadOnlyField()

    class Meta:
        model = Campaign
        fields = '__all__'

class CampaignPublicSerializer(serializers.ModelSerializer):
    """Solo campos públicos para visitantes."""
    is_visible = serializers.ReadOnlyField()

    class Meta:
        model = Campaign
        fields = ['id', 'name', 'slug', 'description', 'image', 'color',
                  'start_date', 'end_date', 'is_visible']
