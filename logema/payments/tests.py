from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
from unittest.mock import patch, MagicMock
import uuid

from .models import Payment, EscrowAccount, Transaction, PaymentDistribution, PaymentMethod
from .escrow_manager import EscrowManager
from properties.models import Property
from locations.models import Secteur, Quartier, Ville, SousPrefecture, Prefecture, Region
from transactions.models import OccupationRequest

User = get_user_model()

class PaymentBaseTestCase(TestCase):
    def setUp(self):
        # Create hierarchy for Secteur
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Conakry", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Dixinn", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Landreah", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)

        # Create Users
        self.owner = User.objects.create_user(username="owner", password="password123")
        self.agent = User.objects.create_user(username="agent", password="password123")
        self.payer = User.objects.create_user(username="payer", password="password123")

        # Create Property
        self.property = Property.objects.create(
            owner=self.owner,
            agent=self.agent,
            title="Appartement de luxe",
            description="Bel appartement",
            property_type="APPARTEMENT",
            price=Decimal("1500000.00"),
            secteur=self.secteur
        )

        # Create OccupationRequest
        self.occupation = OccupationRequest.objects.create(
            property=self.property,
            user=self.payer,
            status='PENDING',
            requires_payment=True,
            payment_amount=Decimal("1500000.00")
        )

class PaymentModelTest(PaymentBaseTestCase):
    def test_payment_creation(self):
        payment = Payment.objects.create(
            occupation_request=self.occupation,
            payer=self.payer,
            amount=Decimal("1500000.00"),
            payment_method='ORANGE_MONEY',
            payment_phone='622112233',
            status='PENDING'
        )
        self.assertEqual(payment.status, 'PENDING')
        self.assertEqual(payment.currency, 'GNF')
        self.assertIsInstance(payment.id, uuid.UUID)

class EscrowManagerTest(PaymentBaseTestCase):
    def setUp(self):
        super().setUp()
        self.payment = Payment.objects.create(
            occupation_request=self.occupation,
            payer=self.payer,
            amount=Decimal("1500000.00"),
            payment_method='ORANGE_MONEY',
            payment_phone='622112233',
            status='PROCESSING'
        )

    def test_hold_payment(self):
        escrow = EscrowManager.hold_payment(self.payment)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, 'HELD_IN_ESCROW')
        self.assertEqual(escrow.status, 'HOLDING')
        self.assertEqual(escrow.held_amount, self.payment.amount)
        self.assertTrue(Transaction.objects.filter(payment=self.payment, status='COMPLETED').exists())

    def test_release_payment(self):
        escrow = EscrowManager.hold_payment(self.payment)
        distributions = EscrowManager.release_payment(escrow)
        
        self.payment.refresh_from_db()
        escrow.refresh_from_db()
        self.occupation.refresh_from_db()
        
        self.assertEqual(self.payment.status, 'RELEASED')
        self.assertEqual(escrow.status, 'RELEASED')
        self.assertEqual(self.occupation.status, 'VALIDATED')
        self.assertEqual(self.occupation.payment_status, 'PAID')
        
        # Check distributions (10% agent, rest owner - fees)
        # 1,500,000 * 0.10 = 150,000 (Agent)
        # 1,500,000 * 0.02 = 30,000 (Platform fee, deducted from owner)
        # 1,500,000 - 150,000 - 30,000 = 1,320,000 (Owner)
        
        agent_dist = PaymentDistribution.objects.get(recipient=self.agent)
        owner_dist = PaymentDistribution.objects.get(recipient=self.owner)
        
        self.assertEqual(agent_dist.amount, Decimal("150000.00"))
        self.assertEqual(owner_dist.amount, Decimal("1320000.00"))

    def test_process_refund(self):
        escrow = EscrowManager.hold_payment(self.payment)
        EscrowManager.process_refund(self.payment, reason="L'utilisateur a changé d'avis")
        
        self.payment.refresh_from_db()
        escrow.refresh_from_db()
        self.occupation.refresh_from_db()
        
        self.assertEqual(self.payment.status, 'REFUNDED')
        self.assertEqual(escrow.status, 'REFUNDED')
        self.assertEqual(self.occupation.status, 'CANCELLED')
        self.assertEqual(self.occupation.payment_status, 'REFUNDED')

class PaymentAPITestCase(PaymentBaseTestCase):
    def setUp(self):
        super().setUp()
        self.client = Client()
        self.client.force_login(self.payer)

    @patch('payments.views.get_payment_provider')
    def test_initiate_payment_api(self, mock_get_provider):
        # Mock provider response
        mock_provider = MagicMock()
        mock_provider.initiate_payment.return_value = {
            'success': True,
            'transaction_id': 'TX123',
            'message': 'Success',
            'ussd_code': '*144#'
        }
        mock_get_provider.return_value = mock_provider

        url = '/api/payments/initiate/'
        data = {
            'occupation_request_id': self.occupation.id,
            'payment_method': 'ORANGE_MONEY',
            'payment_phone': '622112233',
            'save_payment_method': True
        }
        
        response = self.client.post(url, data, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['success'])
        
        # Check if Payment was created
        payment = Payment.objects.get(occupation_request=self.occupation)
        self.assertEqual(payment.status, 'PROCESSING')
        self.assertEqual(payment.transaction_id, 'TX123')
        
        # Check if PaymentMethod was saved
        self.assertTrue(PaymentMethod.objects.filter(user=self.payer, phone_number='622112233').exists())
