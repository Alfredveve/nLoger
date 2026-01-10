from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from properties.models import Property, PropertyImage, ManagementMandate
from accounts.models import User
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur


class PropertyModelTests(TestCase):
    """Tests complets pour le modèle Property"""
    
    def setUp(self):
        # Setup Location hierarchy
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
        self.assertIsNotNone(prop.created_at)
        self.assertIsNotNone(prop.updated_at)
    
    def test_create_property_with_agent(self):
        """Test de la création avec un agent assigné."""
        prop = Property.objects.create(
            owner=self.owner,
            agent=self.agent,
            title="Maison gérée",
            description="Gérée par un agent",
            property_type="VILLA",
            price=10000000,
            secteur=self.secteur
        )
        self.assertEqual(prop.agent, self.agent)
        self.assertEqual(prop.owner, self.owner)

    def test_property_validation(self):
        """Les contraintes de base doivent être respectées."""
        prop = Property(
            owner=self.owner,
            title="Test",
            description="Desc",
            property_type="APPARTEMENT",
            price=1000,
            secteur=self.secteur
        )
        prop.full_clean()  # Should not raise

    def test_missing_owner(self):
        """Une propriété doit avoir un propriétaire."""
        with self.assertRaises(IntegrityError):
            Property.objects.create(
                owner=None,
                title="No Owner",
                description="...",
                property_type="APPARTEMENT",
                price=1000,
                secteur=self.secteur
            )

    def test_property_types(self):
        """Test de tous les types de propriété disponibles."""
        types = ['CHAMBRE_SIMPLE', 'SALON_CHAMBRE', 'APPARTEMENT', 'VILLA', 'STUDIO', 'MAGASIN', 'BUREAU']
        
        for prop_type in types:
            prop = Property.objects.create(
                owner=self.owner,
                title=f"Test {prop_type}",
                description="Test",
                property_type=prop_type,
                price=1000000,
                secteur=self.secteur
            )
            self.assertEqual(prop.property_type, prop_type)

    def test_property_with_coordinates(self):
        """Test de propriété avec coordonnées GPS."""
        prop = Property.objects.create(
            owner=self.owner,
            title="Maison avec GPS",
            description="Coordonnées précises",
            property_type="VILLA",
            price=8000000,
            secteur=self.secteur,
            latitude=9.5092,
            longitude=-13.7122
        )
        self.assertEqual(prop.latitude, 9.5092)
        self.assertEqual(prop.longitude, -13.7122)

    def test_property_preferences(self):
        """Test des préférences religieuses et ethniques."""
        prop = Property.objects.create(
            owner=self.owner,
            title="Maison avec préférences",
            description="Critères spécifiques",
            property_type="APPARTEMENT",
            price=3000000,
            secteur=self.secteur,
            religion_preference="Musulman",
            ethnic_preference="Indifférent"
        )
        self.assertEqual(prop.religion_preference, "Musulman")
        self.assertEqual(prop.ethnic_preference, "Indifférent")

    def test_is_under_validation_property(self):
        """Test de la propriété is_under_validation."""
        from transactions.models import OccupationRequest
        
        prop = Property.objects.create(
            owner=self.owner,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=2000000,
            secteur=self.secteur
        )
        
        # Sans demande d'occupation
        self.assertFalse(prop.is_under_validation)
        
        # Avec demande d'occupation PENDING récente
        tenant = User.objects.create_user(username='tenant1', password='pass123')
        request = OccupationRequest.objects.create(
            property=prop,
            user=tenant,
            status='PENDING',
            payment_amount=prop.price
        )
        
        self.assertTrue(prop.is_under_validation)
        
        # Demande validée
        request.status = 'VALIDATED'
        request.save()
        self.assertFalse(prop.is_under_validation)

    def test_property_string_representation(self):
        """Test de la représentation string."""
        prop = Property.objects.create(
            owner=self.owner,
            title="Ma Belle Maison",
            description="Test",
            property_type="VILLA",
            price=5000000,
            secteur=self.secteur
        )
        expected = "Ma Belle Maison - VILLA"
        self.assertEqual(str(prop), expected)


class PropertyImageTests(TestCase):
    """Tests pour le modèle PropertyImage"""
    
    def setUp(self):
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Kaloum", region=self.region)
        self.sous_prefecture = SousPrefecture.objects.create(name="Kaloum Centre", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry Ville", sous_prefecture=self.sous_prefecture)
        self.quartier = Quartier.objects.create(name="Almamya", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)
        
        self.owner = User.objects.create_user(username='owner1', password='password', is_proprietaire=True)
        
        self.property = Property.objects.create(
            owner=self.owner,
            title="Test Property",
            description="Test",
            property_type="APPARTEMENT",
            price=2000000,
            secteur=self.secteur
        )

    def test_create_property_image(self):
        """Test de création d'image de propriété."""
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        image_file = SimpleUploadedFile("test.jpg", b"file_content", content_type="image/jpeg")
        
        img = PropertyImage.objects.create(
            property=self.property,
            image=image_file,
            caption="Vue extérieure"
        )
        
        self.assertEqual(img.property, self.property)
        self.assertEqual(img.caption, "Vue extérieure")

    def test_multiple_images_per_property(self):
        """Test de plusieurs images pour une propriété."""
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        for i in range(3):
            image_file = SimpleUploadedFile(f"test{i}.jpg", b"file_content", content_type="image/jpeg")
            PropertyImage.objects.create(
                property=self.property,
                image=image_file,
                caption=f"Image {i+1}"
            )
        
        self.assertEqual(self.property.images.count(), 3)


class ManagementMandateTests(TestCase):
    """Tests pour le modèle ManagementMandate"""
    
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner1',
            password='password',
            is_proprietaire=True,
            phone='600000000'
        )
        self.agent = User.objects.create_user(
            username='agent1',
            password='password',
            is_demarcheur=True
        )

    def test_create_mandate(self):
        """Test de création d'un mandat de gestion."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            mandate_type='EXCLUSIVE',
            commission_percentage=10.0,
            property_type='APPARTEMENT',
            location_description='Kaloum, Almamya',
            property_description='3 chambres, 2 salles de bain',
            expected_price=5000000,
            owner_phone='600000000'
        )
        
        self.assertEqual(mandate.owner, self.owner)
        self.assertEqual(mandate.agent, self.agent)
        self.assertEqual(mandate.status, 'PENDING')
        self.assertEqual(mandate.commission_percentage, 10.0)

    def test_mandate_types(self):
        """Test des types de mandat."""
        # Mandat exclusif
        exclusive = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            mandate_type='EXCLUSIVE',
            property_type='VILLA',
            location_description='Test',
            property_description='Test',
            owner_phone='600000000'
        )
        self.assertEqual(exclusive.mandate_type, 'EXCLUSIVE')
        
        # Mandat simple
        simple = ManagementMandate.objects.create(
            owner=self.owner,
            mandate_type='SIMPLE',
            property_type='STUDIO',
            location_description='Test',
            property_description='Test',
            owner_phone='600000000'
        )
        self.assertEqual(simple.mandate_type, 'SIMPLE')

    def test_mandate_status_workflow(self):
        """Test du workflow de statut du mandat."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            mandate_type='EXCLUSIVE',
            property_type='APPARTEMENT',
            location_description='Test',
            property_description='Test',
            owner_phone='600000000'
        )
        
        # PENDING par défaut
        self.assertEqual(mandate.status, 'PENDING')
        
        # ACCEPTED
        mandate.status = 'ACCEPTED'
        mandate.signed_at = timezone.now()
        mandate.save()
        self.assertEqual(mandate.status, 'ACCEPTED')
        self.assertIsNotNone(mandate.signed_at)
        
        # COMPLETED
        mandate.status = 'COMPLETED'
        mandate.save()
        self.assertEqual(mandate.status, 'COMPLETED')

    def test_mandate_signatures(self):
        """Test des signatures numériques."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            mandate_type='EXCLUSIVE',
            property_type='APPARTEMENT',
            location_description='Test',
            property_description='Test',
            owner_phone='600000000',
            signature_owner='owner_signature_hash',
            signature_agent='agent_signature_hash'
        )
        
        self.assertEqual(mandate.signature_owner, 'owner_signature_hash')
        self.assertEqual(mandate.signature_agent, 'agent_signature_hash')

    def test_mandate_string_representation(self):
        """Test de la représentation string du mandat."""
        mandate = ManagementMandate.objects.create(
            owner=self.owner,
            agent=self.agent,
            mandate_type='EXCLUSIVE',
            property_type='APPARTEMENT',
            location_description='Test',
            property_description='Test',
            owner_phone='600000000'
        )
        
        self.assertIn(str(mandate.id), str(mandate))
        self.assertIn(self.owner.username, str(mandate))
