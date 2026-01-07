from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from .models import Property
from accounts.models import User
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class PropertyModelTests(TestCase):
    def setUp(self):
        # Setup Location
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        # Setup Users
        self.owner = User.objects.create_user(username='owner1', password='password', is_proprietaire=True)
        self.agent = User.objects.create_user(username='agent1', password='password', is_demarcheur=True)

    def test_create_property_success(self):
        """Test de la création réussie d'une propriété avec les champs obligatoires."""
        prop = Property.objects.create(
            owner=self.owner,
            title="Bel Appartement",
            description="Description détaillée",
            property_type="APPARTEMENT",
            price=5000000,
            secteur=self.secteur
        )
        self.assertEqual(prop.title, "Bel Appartement")
        self.assertEqual(prop.price, 5000000)
        self.assertTrue(prop.is_available)
    
    def test_create_property_with_agent(self):
        """Test de la création avec un agent assigné."""
        prop = Property.objects.create(
            owner=self.owner,
            agent=self.agent,
            title="Maison gérée",
            description="...",
            property_type="Maison",
            price=10000000,
            secteur=self.secteur
        )
        self.assertEqual(prop.agent, self.agent)

    def test_property_validation(self):
        """Les contraintes de base doivent être respectées (Django valide au save() pour certains champs, mais full_clean() pour d'autres)."""
        prop = Property(
            owner=self.owner,
            title="Test",
            description="Desc",
            property_type="APPARTEMENT",
            price=1000,
            secteur=self.secteur
        )
        prop.full_clean() # Should not raise
        pass

    def test_missing_owner(self):
        """Une propriété doit avoir un propriétaire."""
        with self.assertRaises(IntegrityError):
            Property.objects.create(
                owner=None, # Impossible cause Non-Null
                title="No Owner",
                description="...",
                property_type="APPARTEMENT",
                price=1000,
                secteur=self.secteur
            )

    def test_missing_secteur(self):
        """Une propriété doit avoir un secteur."""
        with self.assertRaises(IntegrityError):
            Property.objects.create(
                owner=self.owner,
                title="No Secteur",
                description="...",
                property_type="APPARTEMENT",
                price=1000,
                secteur=None
            )
