from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from transactions.models import OccupationRequest, VisitVoucher
from properties.models import Property
from accounts.models import User
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur


class OccupationRequestTests(TestCase):
    """Tests pour le modèle OccupationRequest"""
    
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

    def test_create_occupation_request(self):
        """Test de création d'une demande d'occupation."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        self.assertEqual(request.status, 'PENDING')
        self.assertEqual(request.payment_status, 'UNPAID')
        self.assertTrue(request.requires_payment)
        self.assertEqual(request.payment_amount, 5000000)

    def test_occupation_request_status_workflow(self):
        """Test du workflow de statut."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        # PENDING → VALIDATED
        request.status = 'VALIDATED'
        request.save()
        self.assertEqual(request.status, 'VALIDATED')
        
        # PENDING → CANCELLED
        request2 = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        request2.status = 'CANCELLED'
        request2.save()
        self.assertEqual(request2.status, 'CANCELLED')

    def test_payment_status_workflow(self):
        """Test du workflow de statut de paiement."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        # UNPAID → PAID
        request.payment_status = 'PAID'
        request.save()
        self.assertEqual(request.payment_status, 'PAID')
        
        # PAID → REFUNDED
        request.payment_status = 'REFUNDED'
        request.save()
        self.assertEqual(request.payment_status, 'REFUNDED')

    def test_calculate_payment_amount(self):
        """Test du calcul du montant de paiement."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant
        )
        
        calculated_amount = request.calculate_payment_amount()
        self.assertEqual(calculated_amount, self.property.price)

    def test_calculate_payment_amount_no_payment_required(self):
        """Test du calcul quand aucun paiement n'est requis."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            requires_payment=False
        )
        
        calculated_amount = request.calculate_payment_amount()
        self.assertEqual(calculated_amount, 0)

    def test_payment_deadline(self):
        """Test de la date limite de paiement."""
        deadline = timezone.now() + timedelta(hours=5)
        
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000,
            payment_deadline=deadline
        )
        
        self.assertEqual(request.payment_deadline, deadline)

    def test_string_representation(self):
        """Test de la représentation string."""
        request = OccupationRequest.objects.create(
            property=self.property,
            user=self.tenant,
            payment_amount=5000000
        )
        
        self.assertIn(str(request.id), str(request))
        self.assertIn(self.property.title, str(request))


class VisitVoucherTests(TestCase):
    """Tests pour le modèle VisitVoucher"""
    
    def setUp(self):
        # Setup location
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        # Setup users
        self.visitor = User.objects.create_user(username='visitor', password='pass123')
        self.agent = User.objects.create_user(username='agent', password='pass123', is_demarcheur=True)
        self.owner = User.objects.create_user(username='owner', password='pass123', is_proprietaire=True)
        
        # Setup property
        self.property = Property.objects.create(
            owner=self.owner,
            agent=self.agent,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )

    def test_create_visit_voucher(self):
        """Test de création d'un bon de visite."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property
        )
        
        self.assertEqual(visit.status, 'REQUESTED')
        self.assertEqual(visit.agent, self.agent)
        self.assertEqual(visit.visitor, self.visitor)
        self.assertIsNotNone(visit.created_at)

    def test_visit_status_workflow(self):
        """Test du workflow de statut de visite."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property
        )
        
        # REQUESTED → ACCEPTED
        visit.status = 'ACCEPTED'
        visit.scheduled_at = timezone.now() + timedelta(days=1)
        visit.validation_code = '123456'
        visit.save()
        self.assertEqual(visit.status, 'ACCEPTED')
        self.assertIsNotNone(visit.scheduled_at)
        self.assertEqual(visit.validation_code, '123456')
        
        # ACCEPTED → VALIDATED
        visit.status = 'VALIDATED'
        visit.validated_at = timezone.now()
        visit.save()
        self.assertEqual(visit.status, 'VALIDATED')
        self.assertIsNotNone(visit.validated_at)

    def test_visit_rejection(self):
        """Test de rejet d'une visite."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property
        )
        
        visit.status = 'REJECTED'
        visit.save()
        self.assertEqual(visit.status, 'REJECTED')

    def test_visit_cancellation(self):
        """Test d'annulation d'une visite."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            status='ACCEPTED',
            scheduled_at=timezone.now() + timedelta(days=1)
        )
        
        visit.status = 'CANCELLED'
        visit.save()
        self.assertEqual(visit.status, 'CANCELLED')

    def test_visit_missed(self):
        """Test de visite non honorée."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            status='ACCEPTED',
            scheduled_at=timezone.now() - timedelta(days=1)
        )
        
        visit.status = 'MISSED'
        visit.save()
        self.assertEqual(visit.status, 'MISSED')

    def test_visit_with_rating(self):
        """Test de visite avec notation."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            status='VALIDATED',
            validated_at=timezone.now()
        )
        
        visit.rating = 5
        visit.comment = "Excellent service, très professionnel"
        visit.save()
        
        self.assertEqual(visit.rating, 5)
        self.assertEqual(visit.comment, "Excellent service, très professionnel")

    def test_validation_code_generation(self):
        """Test de génération de code de validation."""
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            validation_code='987654'
        )
        
        self.assertEqual(visit.validation_code, '987654')
        self.assertEqual(len(visit.validation_code), 6)

    def test_scheduled_visit(self):
        """Test de visite programmée."""
        scheduled_time = timezone.now() + timedelta(days=2, hours=10)
        
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            status='ACCEPTED',
            scheduled_at=scheduled_time,
            validation_code='111222'
        )
        
        self.assertEqual(visit.scheduled_at, scheduled_time)
        self.assertEqual(visit.status, 'ACCEPTED')

    def test_string_representation(self):
        """Test de la représentation string."""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        visit = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property,
            scheduled_at=scheduled_time
        )
        
        self.assertIn(self.property.title, str(visit))
        self.assertIn(self.visitor.username, str(visit))

    def test_multiple_visits_same_property(self):
        """Test de plusieurs visites pour la même propriété."""
        visitor2 = User.objects.create_user(username='visitor2', password='pass123')
        
        visit1 = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=self.visitor,
            property=self.property
        )
        
        visit2 = VisitVoucher.objects.create(
            agent=self.agent,
            visitor=visitor2,
            property=self.property
        )
        
        self.assertEqual(self.property.visits.count(), 2)
        self.assertNotEqual(visit1.visitor, visit2.visitor)
