from django.test import TestCase
from .models import User
from .serializers import RegisterSerializer

class UserModelTests(TestCase):
    def test_create_user(self):
        """Test de la création d'un utilisateur standard."""
        user = User.objects.create_user(username='testuser', password='password123')
        self.assertEqual(user.username, 'testuser')
        self.assertTrue(user.check_password('password123'))
        self.assertTrue(user.is_locataire)  # Par défaut
        self.assertFalse(user.is_demarcheur)
        self.assertFalse(user.is_proprietaire)
        self.assertEqual(user.kyc_status, 'PENDING')

class UserRegistrationTests(TestCase):
    def test_register_demarcheur(self):
        """Un démarcheur doit être inactif et en attente de vérification."""
        data = {
            'username': 'demarcheur1',
            'email': 'd@test.com',
            'password': 'password123',
            'first_name': 'Jean',
            'last_name': 'Dupont',
            'phone': '600000000',
            'role': 'DEMARCHEUR'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        self.assertTrue(user.is_demarcheur)
        self.assertFalse(user.is_active)  # Doit être inactif
        self.assertEqual(user.kyc_status, 'PENDING')

    def test_register_proprietaire(self):
        """Un propriétaire peut être actif directement (selon la logique actuelle)."""
        data = {
            'username': 'proprio1',
            'email': 'p@test.com',
            'password': 'password123',
            'first_name': 'Paul',
            'last_name': 'Proprio',
            'phone': '600000000',
            'role': 'PROPRIETAIRE'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertTrue(user.is_proprietaire)
        # Note: Dans le serializer actuel, on ne set pas is_active=False pour le proprio, 
        # donc il est True par défaut (User default).
        self.assertTrue(user.is_active) 

    def test_register_locataire(self):
        """Un locataire classique."""
        data = {
            'username': 'locataire1',
            'email': 'l@test.com',
            'password': 'password123',
            'first_name': 'Luc',
            'last_name': 'Locataire',
            'phone': '600000000',
            'role': 'LOCATAIRE'
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertTrue(user.is_locataire)
        self.assertTrue(user.is_active)
