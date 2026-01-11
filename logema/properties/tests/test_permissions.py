from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from properties.models import Property
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

User = get_user_model()

class PropertyPermissionTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a basic location structure
        self.region = Region.objects.create(name="Conakry")
        self.prefecture = Prefecture.objects.create(name="Conakry", region=self.region)
        self.sp = SousPrefecture.objects.create(name="Kaloum", prefecture=self.prefecture)
        self.ville = Ville.objects.create(name="Conakry", sous_prefecture=self.sp)
        self.quartier = Quartier.objects.create(name="Boulbinet", ville=self.ville)
        self.secteur = Secteur.objects.create(name="Secteur 1", quartier=self.quartier)

        # Create different users
        self.tenant = User.objects.create_user(
            username='tenant', email='tenant@test.com', password='password',
            is_locataire=True, is_proprietaire=False, is_demarcheur=False,
            kyc_status='VERIFIED'
        )
        
        self.unverified_owner = User.objects.create_user(
            username='u_owner', email='u_owner@test.com', password='password',
            is_locataire=False, is_proprietaire=True, is_demarcheur=False,
            kyc_status='PENDING'
        )
        
        self.verified_owner = User.objects.create_user(
            username='v_owner', email='v_owner@test.com', password='password',
            is_locataire=False, is_proprietaire=True, is_demarcheur=False,
            kyc_status='VERIFIED'
        )

    def test_tenant_cannot_create_property(self):
        self.client.force_authenticate(user=self.tenant)
        data = {
            'title': 'Test Property',
            'description': 'A very long description for the test property',
            'property_type': 'APPARTEMENT',
            'price': 1000,
            'secteur': self.secteur.id
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unverified_owner_cannot_create_property(self):
        self.client.force_authenticate(user=self.unverified_owner)
        data = {
            'title': 'Test Property',
            'description': 'A very long description for the test property',
            'property_type': 'APPARTEMENT',
            'price': 1000,
            'secteur': self.secteur.id
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_verified_owner_can_create_property(self):
        self.client.force_authenticate(user=self.verified_owner)
        data = {
            'title': 'Test Property',
            'description': 'A very long description for the test property',
            'property_type': 'APPARTEMENT',
            'price': 1000,
            'secteur': self.secteur.id
        }
        response = self.client.post('/api/properties/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
