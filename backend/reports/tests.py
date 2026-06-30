from decimal import Decimal
from django.test import TestCase, Client
from django.utils import timezone

from accounts.models import User
from campaigns.models import Campaign
from products.models import Product
from orders.models import Order, OrderItem
from payments.models import Payment


class ReportsBaseTestCase(TestCase):
    """Base para todos los tests de reportes."""

    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_user(
            username='admin', password='test1234', role=User.ROLE_ADMIN
        )
        self.operator = User.objects.create_user(
            username='operador', password='test1234', role=User.ROLE_OPERATOR
        )
        self.campaign = Campaign.objects.create(
            name='Remera 2026', is_active=True, status=Campaign.STATUS_ACTIVE,
            start_date=timezone.now().date()
        )
        self.product = Product.objects.create(
            campaign=self.campaign, name='Remera Blanca',
            price=Decimal('2500.00')
        )
        self.order = Order.objects.create(
            campaign=self.campaign,
            customer_name='Juan Pérez',
            phone='123456789',
            student_name='Mateo Pérez',
            classroom='Sala 3',
        )
        OrderItem.objects.create(
            order=self.order, product=self.product,
            quantity=2, unit_price=Decimal('2500.00')
        )
        # Crear pago y marcar pedido como pagado
        Payment.objects.create(
            order=self.order, method=Payment.METHOD_TRANSFER,
            status=Payment.STATUS_VERIFIED
        )
        self.order.status = Order.STATUS_PAID
        self.order.save()

    def _login(self, user):
        self.client.login(username=user.username, password='test1234')


class DashboardViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/dashboard')
        self.assertEqual(resp.status_code, 403)

    def test_admin_can_access(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('total_orders', data)
        self.assertIn('total_sales', data)
        self.assertIn('total_collected', data)
        self.assertIn('pending_amount', data)
        self.assertIn('pending_deliveries', data)
        self.assertIn('orders_by_status', data)
        self.assertIn('latest_orders', data)

    def test_operator_can_access(self):
        self._login(self.operator)
        resp = self.client.get('/api/reports/dashboard')
        self.assertEqual(resp.status_code, 200)

    def test_dashboard_metrics(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard')
        data = resp.json()
        self.assertEqual(data['total_orders'], 1)
        self.assertEqual(data['total_sales'], '5000.00')
        self.assertEqual(data['total_collected'], '5000.00')
        self.assertEqual(data['pending_amount'], '0.00')
        self.assertEqual(data['pending_deliveries'], 1)


class CampaignReportViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/campaigns')
        self.assertEqual(resp.status_code, 403)

    def test_returns_campaign_data(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/campaigns')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Remera 2026')
        self.assertEqual(data[0]['total_orders'], 1)
        self.assertEqual(data[0]['total_sales'], '5000.00')

    def test_filter_by_campaign(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/campaigns?campaign=otra-campana')
        data = resp.json()
        self.assertEqual(len(data), 0)


class ProductReportViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/products')
        self.assertEqual(resp.status_code, 403)

    def test_returns_product_data(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/products')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'Remera Blanca')
        self.assertEqual(data[0]['total_quantity'], 2)
        self.assertEqual(data[0]['total_revenue'], '5000.00')
        self.assertEqual(data[0]['campaign'], 'Remera 2026')


class ClassroomReportViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/classrooms')
        self.assertEqual(resp.status_code, 403)

    def test_returns_classroom_data(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/classrooms')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['classroom'], 'Sala 3')
        self.assertEqual(data[0]['total_orders'], 1)
        self.assertEqual(data[0]['total_amount'], '5000.00')


class ExcelExportViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/export/excel')
        self.assertEqual(resp.status_code, 403)

    def test_returns_excel_file(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/export/excel')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(
            resp['Content-Type'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        self.assertTrue(resp.streaming)
        content = b''.join(resp.streaming_content)
        self.assertGreater(len(content), 0)


class PDFExportViewTests(ReportsBaseTestCase):

    def test_requires_auth(self):
        resp = self.client.get('/api/reports/export/pdf')
        self.assertEqual(resp.status_code, 403)

    def test_returns_pdf_file(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/export/pdf')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/pdf')
        self.assertTrue(resp.streaming)
        content = b''.join(resp.streaming_content)
        self.assertGreater(len(content), 0)


class FilterTests(ReportsBaseTestCase):
    """Tests de filtros por fecha y estado."""

    def test_filter_by_status(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard?status=pagado')
        data = resp.json()
        self.assertEqual(data['total_orders'], 1)

    def test_filter_by_status_empty(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard?status=entregado')
        data = resp.json()
        self.assertEqual(data['total_orders'], 0)

    def test_filter_by_date_range(self):
        self._login(self.admin)
        today = timezone.now().strftime('%Y-%m-%d')
        resp = self.client.get(f'/api/reports/dashboard?date_from={today}&date_to={today}')
        data = resp.json()
        self.assertEqual(data['total_orders'], 1)

    def test_filter_by_date_outside(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard?date_from=2000-01-01&date_to=2000-01-01')
        data = resp.json()
        self.assertEqual(data['total_orders'], 0)


class CancelledOrderExclusionTests(ReportsBaseTestCase):
    """Pedidos cancelados no deben sumar en ventas ni cobros."""

    def setUp(self):
        super().setUp()
        # Crear segundo pedido cancelado
        order2 = Order.objects.create(
            campaign=self.campaign,
            customer_name='Ana López',
            phone='987654321',
            student_name='Lucía López',
            classroom='Sala 1',
            status=Order.STATUS_CANCELLED,
        )
        OrderItem.objects.create(
            order=order2, product=self.product,
            quantity=1, unit_price=Decimal('2500.00')
        )

    def test_cancelled_not_in_sales(self):
        self._login(self.admin)
        resp = self.client.get('/api/reports/dashboard')
        data = resp.json()
        # Solo el pedido pagado suma
        self.assertEqual(data['total_orders'], 2)
        self.assertEqual(data['total_sales'], '5000.00')
