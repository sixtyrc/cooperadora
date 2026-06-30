from django.urls import path
from . import views

urlpatterns = [
    # Público
    path('payments', views.PaymentCreateView.as_view(), name='payment-create'),
    path('payments/<int:pk>/pdf', views.PaymentPdfView.as_view(), name='payment-pdf'),
    path('payments/ocr', views.PaymentOcrView.as_view(), name='payment-ocr'),
    # Admin
    path('admin/payments', views.PaymentAdminListView.as_view(), name='payment-admin-list'),
    path('admin/payments/<int:pk>', views.PaymentAdminDetailView.as_view(), name='payment-admin-detail'),
]
