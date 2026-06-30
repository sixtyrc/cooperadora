from django.urls import path

from .views import (
    CampaignReportView,
    ClassroomReportView,
    DashboardView,
    ExcelExportView,
    FinancialReportView,
    PDFExportView,
    ProductReportView,
)

urlpatterns = [
    path('reports/dashboard', DashboardView.as_view(), name='reports-dashboard'),
    path('reports/campaigns', CampaignReportView.as_view(), name='reports-campaigns'),
    path('reports/products', ProductReportView.as_view(), name='reports-products'),
    path('reports/classrooms', ClassroomReportView.as_view(), name='reports-classrooms'),
    path('reports/financial', FinancialReportView.as_view(), name='reports-financial'),
    path('reports/export/excel', ExcelExportView.as_view(), name='reports-export-excel'),
    path('reports/export/pdf', PDFExportView.as_view(), name='reports-export-pdf'),
]
