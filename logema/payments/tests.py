from django.test import TestCase
from django.utils import timezone
from django.db.utils import IntegrityError
from decimal import Decimal
from datetime import timedelta

from payments.models import (
    Payment, EscrowAccount, PaymentDistribution, 
    Transaction, PaymentMethod, PaymentDispute
)
from transactions.models import OccupationRequest
from properties.models import Property
from accounts.models import User
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur


class PaymentModelTests(TestCase):
    """Tests pour le modèle Payment"""
    
    def setUp(self):
        # Setup location
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        # Setup users
        self.tenant = User.objects.create_user(username='tenant', password='pass123')
        self.owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        
        # Setup property
        self.property = Property.objects.create(
            owner=self.owner,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )
        
        # Setup occupation request
        self.occupation_request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )

    def test_create_payment(self):
        """Test de création d'un paiement."""
        payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY',
            payment_phone='622000000'
        )
        
        self.assertEqual(payment.amount, 5000000)
        self.assertEqual(payment.status, 'PENDING')
        self.assertEqual(payment.currency, 'GNF')
        self.assertEqual(payment.payer, self.tenant)

    def test_payment_methods(self):
        """Test des différentes méthodes de paiement."""
        methods = ['ORANGE_MONEY', 'MTN_MONEY', 'WAVE', 'BANK_TRANSFER', 'CASH']
        
        for method in methods:
            payment = Payment.objects.create(
                occupation_request=self.occupation_request,
                payer=self.tenant,
                amount=1000000,
                payment_method=method
            )
            self.assertEqual(payment.payment_method, method)

    def test_payment_status_workflow(self):
        """Test du workflow de statut de paiement."""
        payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )
        
        # PENDING → PROCESSING
        payment.status = 'PROCESSING'
        payment.save()
        self.assertEqual(payment.status, 'PROCESSING')
        
        # PROCESSING → HELD_IN_ESCROW
        payment.status = 'HELD_IN_ESCROW'
        payment.save()
        self.assertEqual(payment.status, 'HELD_IN_ESCROW')
        
        # HELD_IN_ESCROW → RELEASED
        payment.status = 'RELEASED'
        payment.completed_at = timezone.now()
        payment.save()
        self.assertEqual(payment.status, 'RELEASED')
        self.assertIsNotNone(payment.completed_at)

    def test_payment_uuid(self):
        """Test que le paiement utilise un UUID."""
        payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )
        
        self.assertIsNotNone(payment.id)
        # UUID should be a string representation
        self.assertTrue(len(str(payment.id)) > 0)

    def test_payment_string_representation(self):
        """Test de la représentation string."""
        payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )
        
        self.assertIn(str(payment.amount), str(payment))
        self.assertIn('GNF', str(payment))


class EscrowAccountTests(TestCase):
    """Tests pour le système d'escrow"""
    
    def setUp(self):
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        self.tenant = User.objects.create_user(username='tenant', password='pass123')
        self.owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        
        self.property = Property.objects.create(
            owner=self.owner,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )
        
        self.occupation_request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        self.payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )

    def test_create_escrow(self):
        """Test de création d'un compte escrow."""
        escrow = EscrowAccount.objects.create(
            payment=self.payment,
            held_amount=5000000
        )
        
        self.assertEqual(escrow.held_amount, 5000000)
        self.assertEqual(escrow.status, 'HOLDING')
        self.assertIsNotNone(escrow.held_at)

    def test_escrow_release(self):
        """Test de libération des fonds escrow."""
        escrow = EscrowAccount.objects.create(
            payment=self.payment,
            held_amount=5000000
        )
        
        # Libération
        escrow.status = 'RELEASED'
        escrow.released_at = timezone.now()
        escrow.save()
        
        self.assertEqual(escrow.status, 'RELEASED')
        self.assertIsNotNone(escrow.released_at)

    def test_escrow_refund(self):
        """Test de remboursement depuis escrow."""
        escrow = EscrowAccount.objects.create(
            payment=self.payment,
            held_amount=5000000
        )
        
        # Remboursement
        escrow.status = 'REFUNDED'
        escrow.refund_reason = "Propriété non conforme"
        escrow.save()
        
        self.assertEqual(escrow.status, 'REFUNDED')
        self.assertEqual(escrow.refund_reason, "Propriété non conforme")

    def test_escrow_scheduled_release(self):
        """Test de libération programmée."""
        release_date = timezone.now() + timedelta(days=7)
        
        escrow = EscrowAccount.objects.create(
            payment=self.payment,
            held_amount=5000000,
            release_scheduled_date=release_date
        )
        
        self.assertEqual(escrow.release_scheduled_date, release_date)


class PaymentDistributionTests(TestCase):
    """Tests pour la distribution des paiements"""
    
    def setUp(self):
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        self.tenant = User.objects.create_user(username='tenant', password='pass123')
        self.owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        self.agent = User.objects.create_user(username='agent', password='pass123', is_demarcheur=True)
        
        self.property = Property.objects.create(
            owner=self.owner,
            agent=self.agent,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )
        
        self.occupation_request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        self.payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )

    def test_owner_payment_distribution(self):
        """Test de distribution au propriétaire."""
        distribution = PaymentDistribution.objects.create(
            payment=self.payment,
            recipient=self.owner,
            amount=4000000,
            distribution_type='OWNER_PAYMENT'
        )
        
        self.assertEqual(distribution.amount, 4000000)
        self.assertEqual(distribution.distribution_type, 'OWNER_PAYMENT')
        self.assertEqual(distribution.status, 'PENDING')

    def test_agent_commission_distribution(self):
        """Test de distribution de commission à l'agent."""
        distribution = PaymentDistribution.objects.create(
            payment=self.payment,
            recipient=self.agent,
            amount=500000,
            distribution_type='AGENT_COMMISSION'
        )
        
        self.assertEqual(distribution.distribution_type, 'AGENT_COMMISSION')
        self.assertEqual(distribution.recipient, self.agent)

    def test_platform_fee_distribution(self):
        """Test de frais de plateforme."""
        platform_user = User.objects.create_user(username='platform', password='pass123')
        
        distribution = PaymentDistribution.objects.create(
            payment=self.payment,
            recipient=platform_user,
            amount=500000,
            distribution_type='PLATFORM_FEE'
        )
        
        self.assertEqual(distribution.distribution_type, 'PLATFORM_FEE')

    def test_distribution_completion(self):
        """Test de complétion d'une distribution."""
        distribution = PaymentDistribution.objects.create(
            payment=self.payment,
            recipient=self.owner,
            amount=4000000,
            distribution_type='OWNER_PAYMENT'
        )
        
        distribution.status = 'COMPLETED'
        distribution.completed_at = timezone.now()
        distribution.save()
        
        self.assertEqual(distribution.status, 'COMPLETED')
        self.assertIsNotNone(distribution.completed_at)


class PaymentMethodTests(TestCase):
    """Tests pour les méthodes de paiement enregistrées"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='user1', password='pass123')

    def test_create_payment_method(self):
        """Test de création d'une méthode de paiement."""
        method = PaymentMethod.objects.create(
            user=self.user,
            method_type='ORANGE_MONEY',
            phone_number='622000000',
            nickname='Mon Orange Money'
        )
        
        self.assertEqual(method.user, self.user)
        self.assertEqual(method.method_type, 'ORANGE_MONEY')
        self.assertFalse(method.is_default)
        self.assertFalse(method.is_verified)

    def test_default_payment_method(self):
        """Test de méthode de paiement par défaut."""
        method1 = PaymentMethod.objects.create(
            user=self.user,
            method_type='ORANGE_MONEY',
            phone_number='622000000',
            is_default=True
        )
        
        # Créer une deuxième méthode par défaut
        method2 = PaymentMethod.objects.create(
            user=self.user,
            method_type='MTN_MONEY',
            phone_number='655000000',
            is_default=True
        )
        
        # La première ne devrait plus être par défaut
        method1.refresh_from_db()
        self.assertFalse(method1.is_default)
        self.assertTrue(method2.is_default)

    def test_unique_payment_method(self):
        """Test d'unicité de méthode de paiement."""
        PaymentMethod.objects.create(
            user=self.user,
            method_type='ORANGE_MONEY',
            phone_number='622000000'
        )
        
        # Même combinaison devrait échouer
        with self.assertRaises(IntegrityError):
            PaymentMethod.objects.create(
                user=self.user,
                method_type='ORANGE_MONEY',
                phone_number='622000000'
            )


class PaymentDisputeTests(TestCase):
    """Tests pour les litiges de paiement"""
    
    def setUp(self):
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        self.tenant = User.objects.create_user(username='tenant', password='pass123')
        self.owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        self.admin = User.objects.create_user(username='admin', password='pass123', is_staff=True)
        
        self.property = Property.objects.create(
            owner=self.owner,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )
        
        self.occupation_request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        self.payment = Payment.objects.create(
            occupation_request=self.occupation_request,
            payer=self.tenant,
            amount=5000000,
            payment_method='ORANGE_MONEY'
        )

    def test_create_dispute(self):
        """Test de création d'un litige."""
        dispute = PaymentDispute.objects.create(
            payment=self.payment,
            raised_by=self.tenant,
            reason="Le logement ne correspond pas à la description"
        )
        
        self.assertEqual(dispute.status, 'OPEN')
        self.assertEqual(dispute.raised_by, self.tenant)
        self.assertIsNotNone(dispute.created_at)

    def test_dispute_resolution_full_refund(self):
        """Test de résolution avec remboursement total."""
        dispute = PaymentDispute.objects.create(
            payment=self.payment,
            raised_by=self.tenant,
            reason="Problème majeur"
        )
        
        dispute.status = 'RESOLVED'
        dispute.resolution = 'REFUND_FULL'
        dispute.resolution_notes = "Remboursement total accordé"
        dispute.resolved_by = self.admin
        dispute.resolved_at = timezone.now()
        dispute.save()
        
        self.assertEqual(dispute.resolution, 'REFUND_FULL')
        self.assertEqual(dispute.status, 'RESOLVED')
        self.assertIsNotNone(dispute.resolved_at)

    def test_dispute_resolution_partial_refund(self):
        """Test de résolution avec remboursement partiel."""
        dispute = PaymentDispute.objects.create(
            payment=self.payment,
            raised_by=self.tenant,
            reason="Problème mineur"
        )
        
        dispute.status = 'RESOLVED'
        dispute.resolution = 'REFUND_PARTIAL'
        dispute.resolution_notes = "Remboursement de 50%"
        dispute.resolved_by = self.admin
        dispute.resolved_at = timezone.now()
        dispute.save()
        
        self.assertEqual(dispute.resolution, 'REFUND_PARTIAL')

    def test_dispute_resolution_no_refund(self):
        """Test de résolution sans remboursement."""
        dispute = PaymentDispute.objects.create(
            payment=self.payment,
            raised_by=self.tenant,
            reason="Réclamation non fondée"
        )
        
        dispute.status = 'RESOLVED'
        dispute.resolution = 'NO_REFUND'
        dispute.resolution_notes = "Réclamation rejetée"
        dispute.resolved_by = self.admin
        dispute.resolved_at = timezone.now()
        dispute.save()
        
        self.assertEqual(dispute.resolution, 'NO_REFUND')

    def test_dispute_workflow(self):
        """Test du workflow complet de litige."""
        dispute = PaymentDispute.objects.create(
            payment=self.payment,
            raised_by=self.tenant,
            reason="Test"
        )
        
        # OPEN → INVESTIGATING
        dispute.status = 'INVESTIGATING'
        dispute.save()
        self.assertEqual(dispute.status, 'INVESTIGATING')
        
        # INVESTIGATING → RESOLVED
        dispute.status = 'RESOLVED'
        dispute.resolution = 'REFUND_FULL'
        dispute.resolved_by = self.admin
        dispute.resolved_at = timezone.now()
        dispute.save()
        self.assertEqual(dispute.status, 'RESOLVED')
        
        # RESOLVED → CLOSED
        dispute.status = 'CLOSED'
        dispute.save()
        self.assertEqual(dispute.status, 'CLOSED')
