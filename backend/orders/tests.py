from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from campaigns.models import Campaign
from products.models import Product
from .models import Order


class PublicOrderFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.campaign = Campaign.objects.create(
            name='Campaña activa',
            is_active=True,
            status=Campaign.STATUS_ACTIVE,
            start_date=timezone.now().date() - timedelta(days=1),
            end_date=timezone.now().date() + timedelta(days=1),
        )
        self.product = Product.objects.create(
            campaign=self.campaign, name='Producto', price=1000, is_active=True
        )
        self.payload = {
            'campaign': self.campaign.pk,
            'customer_name': 'Familia Prueba',
            'phone': '1155551234',
            'student_name': 'Alumno',
            'classroom': 'Sala A',
            'notes': '',
            'items': [{'product': self.product.pk, 'quantity': 2}],
        }

    def test_creates_valid_order(self):
        response = self.client.post('/api/orders', self.payload, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.get().total, 2000)

    def test_rejects_product_from_another_campaign(self):
        other = Campaign.objects.create(name='Otra')
        product = Product.objects.create(campaign=other, name='Ajeno', price=1)
        self.payload['items'] = [{'product': product.pk, 'quantity': 1}]
        response = self.client.post('/api/orders', self.payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_rejects_inactive_campaign(self):
        self.campaign.is_active = False
        self.campaign.save()
        response = self.client.post('/api/orders', self.payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_query_requires_matching_phone(self):
        self.client.post('/api/orders', self.payload, format='json')
        order = Order.objects.get()
        denied = self.client.get(f'/api/orders/{order.code}?phone=111111')
        allowed = self.client.get(f'/api/orders/{order.code}?phone=1155551234')
        self.assertEqual(denied.status_code, 404)
        self.assertEqual(allowed.status_code, 200)

    def test_pdf_requires_matching_phone(self):
        self.client.post('/api/orders', self.payload, format='json')
        order = Order.objects.get()
        denied = self.client.get(f'/api/orders/{order.code}/pdf?phone=111111')
        self.assertEqual(denied.status_code, 404)
