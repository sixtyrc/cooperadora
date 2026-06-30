from datetime import datetime

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminOrOperator
from .serializers import (
    CampaignReportSerializer,
    ClassroomReportSerializer,
    DashboardSerializer,
    FinancialReportSerializer,
    ProductReportSerializer,
)
from .utils import (
    build_campaign_report,
    build_classroom_report,
    build_dashboard_data,
    build_financial_report,
    build_product_report,
    export_excel,
    export_pdf,
    get_filtered_orders,
)


def _build_report_data(request):
    qs = get_filtered_orders(request)
    return {
        'dashboard': build_dashboard_data(qs),
        'campaigns': build_campaign_report(qs),
        'products': build_product_report(qs),
        'classrooms': build_classroom_report(qs),
    }


class DashboardView(APIView):
    """GET /api/reports/dashboard"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        qs = get_filtered_orders(request)
        data = build_dashboard_data(qs)
        serializer = DashboardSerializer(data)
        return Response(serializer.data)


class CampaignReportView(APIView):
    """GET /api/reports/campaigns"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        qs = get_filtered_orders(request)
        data = build_campaign_report(qs)
        serializer = CampaignReportSerializer(data, many=True)
        return Response(serializer.data)


class ProductReportView(APIView):
    """GET /api/reports/products"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        qs = get_filtered_orders(request)
        data = build_product_report(qs)
        serializer = ProductReportSerializer(data, many=True)
        return Response(serializer.data)


class ClassroomReportView(APIView):
    """GET /api/reports/classrooms"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        qs = get_filtered_orders(request)
        data = build_classroom_report(qs)
        serializer = ClassroomReportSerializer(data, many=True)
        return Response(serializer.data)


class FinancialReportView(APIView):
    """GET /api/reports/financial"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        qs = get_filtered_orders(request)
        data = build_financial_report(qs)
        serializer = FinancialReportSerializer(data)
        return Response(serializer.data)


class ExcelExportView(APIView):
    """GET /api/reports/export/excel"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        try:
            data = _build_report_data(request)
            buffer = export_excel(data)
            filename = f"cooperadora_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            response = FileResponse(
                buffer,
                as_attachment=True,
                filename=filename,
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            return response
        except Exception as e:
            return Response({"detail": f"Error al generar Excel: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PDFExportView(APIView):
    """GET /api/reports/export/pdf"""
    permission_classes = [IsAdminOrOperator]

    def get(self, request):
        try:
            data = _build_report_data(request)
            buffer = export_pdf(data)
            filename = f"cooperadora_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            response = FileResponse(
                buffer,
                as_attachment=True,
                filename=filename,
                content_type='application/pdf'
            )
            return response
        except Exception as e:
            return Response({"detail": f"Error al generar PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
