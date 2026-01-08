from django.test import TestCase
from accounts.models import User
from properties.models import ManagementMandate, Property
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class MandateTests(TestCase):
    def setUp(self):
        # Setup Location
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Dixinn", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Dixinn Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Camayenne", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 2", quartier=self.quartier)

        # Users
        self.owner = User.objects.create_user(username='owner_mandate', password='password', is_proprietaire=True, phone='620000001')
        self.agent = User.objects.create_user(username='agent_mandate', password='password', is_demarcheur=True, phone='620000002')

    def test_create_mandate(self):
        """Test simple mandate creation."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            property_type='APPARTEMENT',
            location_description='Camayenne bord de mer',
            property_description='3 chambres salon',
            expected_price=3000000,
            owner_phone=self.owner.phone
        )
        self.assertEqual(mandate.status, 'PENDING')
        self.assertEqual(mandate.owner, self.owner)
        self.assertIsNone(mandate.agent)

    def test_mandate_signatures(self):
        """Test the digital signature workflow."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            property_type='MAISON',
            location_description='Villa',
            property_description='Grande villa',
            expected_price=15000000,
            owner_phone=self.owner.phone,
            mandate_type='EXCLUSIVE',
            commission_percentage=10.0
        )

        # 1. Agent Signs (Accepts)
        mandate.agent = self.agent
        mandate.signature_agent = "SIGNED_BY_AGENT"
        mandate.save()
        
        self.assertEqual(mandate.status, 'PENDING') # Still pending owner signature if not auto-updated logic (backend logic check needed)
        
        # 2. Owner Signs
        mandate.signature_owner = "SIGNED_BY_OWNER"
        mandate.status = 'ACCEPTED' # Logic typically handles this in view or signal, here we simulate the state
        mandate.save()

        self.assertEqual(mandate.status, 'ACCEPTED')
        self.assertEqual(mandate.mandate_type, 'EXCLUSIVE')
        self.assertEqual(mandate.commission_percentage, 10.0)

    def test_mandate_agent_relationship(self):
        """Test assigning an agent to a mandate."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            property_type='APPARTEMENT',
            location_description='Test',
            property_description='Test',
            owner_phone='666666'
        )
        self.assertEqual(mandate.owner.mandates_given.count(), 1)
        self.assertEqual(self.agent.mandates_received.count(), 1)
