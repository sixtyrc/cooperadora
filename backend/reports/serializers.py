from rest_framework import serializers


class DashboardSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    total_sales = serializers.CharField()
    total_collected = serializers.CharField()
    pending_amount = serializers.CharField()
    pending_deliveries = serializers.IntegerField()
    orders_by_status = serializers.DictField(child=serializers.IntegerField())
    latest_orders = serializers.ListField(child=serializers.DictField())


class CampaignReportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.SlugField()
    total_orders = serializers.IntegerField()
    total_sales = serializers.CharField()
    total_collected = serializers.CharField()
    pending_amount = serializers.CharField()


class ProductReportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    campaign = serializers.CharField()
    total_quantity = serializers.IntegerField()
    total_revenue = serializers.CharField()
    average_price = serializers.CharField()


class ClassroomReportSerializer(serializers.Serializer):
    classroom = serializers.CharField()
    total_orders = serializers.IntegerField()
    total_amount = serializers.CharField()


class FinancialCampaignRowSerializer(serializers.Serializer):
    name = serializers.CharField()
    total_sales = serializers.CharField()
    total_cost = serializers.CharField()
    total_profit = serializers.CharField()
    quantity_sold = serializers.IntegerField()


class FinancialReportSerializer(serializers.Serializer):
    total_sales = serializers.CharField()
    total_collected_cash = serializers.CharField()
    total_collected_transfer = serializers.CharField()
    total_cost = serializers.CharField()
    total_profit = serializers.CharField()
    profit_margin = serializers.CharField()
    by_campaign = FinancialCampaignRowSerializer(many=True)
