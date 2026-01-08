from django.test import TestCase
from accounts.models import User
from properties.models import Property
from transactions.models import VisitVoucher
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class VisitTests(TestCase):
    def setUp(self):
        # Setup Location
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Ratoma", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Ratoma Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Kipé", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 3", quartier=self.quartier)

        # Users
        self.agent = User.objects.create_user(username='agent_visit', password='password', is_demarcheur=True)
        self.visitor = User.objects.create_user(username='visitor_visit', password='password', is_locataire=True)

        # Property
        self.prop = Property.objects.create(
            owner=self.agent, # Agent implies owner or manager here
            agent=self.agent,
            title="Appartement visite",
            property_type="APPARTEMENT",
            price=2000000,
            secteur=self.secteur
        )

    def test_create_visit_voucher(self):
        """Test generating a visit voucher with a code."""
        from django.utils import timezone
        voucher = VisitVoucher.objects.create(
            property=self.prop,
            visitor=self.visitor,
            agent=self.agent,
            validation_code="123456",
            scheduled_at=timezone.now()
        )
        self.assertEqual(voucher.status, 'PENDING')
        self.assertEqual(voucher.validation_code, "123456")
        self.assertIsNone(voucher.validated_at)

    def test_validate_visit(self):
        """Test validating a visit."""
        from django.utils import timezone
        voucher = VisitVoucher.objects.create(
            property=self.prop,
            visitor=self.visitor,
            agent=self.agent,
            validation_code="ABCDEF",
            scheduled_at=timezone.now()
        )
        
        # Simulate Validation
        voucher.status = 'VALIDATED'
        voucher.validated_at = timezone.now()
        voucher.save()

        self.assertEqual(voucher.status, 'VALIDATED')
        self.assertIsNotNone(voucher.validated_at)

    def test_rate_visit(self):
        """Test rating a completed visit."""
        from django.utils import timezone
        voucher = VisitVoucher.objects.create(
            property=self.prop,
            visitor=self.visitor,
            agent=self.agent,
            status='VALIDATED',
            validation_code="XYZ123",
            scheduled_at=timezone.now()
        )
        
        voucher.rating = 5
        voucher.comment = "Super agent !"
        voucher.save()
        
        self.assertEqual(voucher.rating, 5)
        self.assertEqual(voucher.comment, "Super agent !")
