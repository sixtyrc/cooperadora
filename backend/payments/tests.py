from decimal import Decimal

from django.test import TestCase

from campaigns.models import Campaign
from orders.models import Order
from .models import Payment


class PaymentReconciliationTests(TestCase):
    def setUp(self):
        campaign = Campaign.objects.create(name='Campaña')
        self.order = Order.objects.create(
            campaign=campaign,
            customer_name='Familia',
            phone='3624617500',
            student_name='Alumno',
            classroom='Sala',
            total=Decimal('8500.00'),
        )

    def payment(self, **values):
        defaults = {
            'order': self.order,
            'method': Payment.METHOD_TRANSFER,
            'ocr_amount': Decimal('8500.00'),
            'ocr_operation_id': 'OP-123',
            'voucher_hash': 'a' * 64,
        }
        defaults.update(values)
        return Payment.objects.create(**defaults)

    def test_matching_amount_is_reconciled(self):
        payment = self.payment()
        self.assertEqual(payment.reconcile(), Payment.RECONCILIATION_MATCHED)

    def test_different_amount_is_flagged(self):
        payment = self.payment(ocr_amount=Decimal('8000.00'))
        self.assertEqual(payment.reconcile(), Payment.RECONCILIATION_MISMATCH)

    def test_same_file_is_flagged_as_duplicate(self):
        original = self.payment()
        original.reconcile()
        duplicate = self.payment(ocr_operation_id='OP-456')
        self.assertEqual(duplicate.reconcile(), Payment.RECONCILIATION_DUPLICATE)
        self.assertEqual(duplicate.duplicate_of, original)

    def test_same_operation_is_flagged_as_duplicate(self):
        original = self.payment(voucher_hash='a' * 64)
        original.reconcile()
        duplicate = self.payment(voucher_hash='b' * 64)
        self.assertEqual(duplicate.reconcile(), Payment.RECONCILIATION_DUPLICATE)
        self.assertEqual(duplicate.duplicate_of, original)

    def test_cash_requires_manual_control(self):
        payment = self.payment(method=Payment.METHOD_CASH)
        self.assertEqual(payment.reconcile(), Payment.RECONCILIATION_MANUAL)
