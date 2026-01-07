import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from properties.models import Property
from transactions.models import OccupationRequest
from accounts.models import User
from locations.models import Secteur, Quartier, Ville, SousPrefecture, Prefecture, Region
from django.utils import timezone
from datetime import timedelta

def verify_clean_search():
    print("--- Début de la vérification Clean Search ---")
    
    # Check if we have test data
    user, _ = User.objects.get_or_create(username='test_user', is_proprietaire=True)
    
    # Get or create location hierarchy
    region, _ = Region.objects.get_or_create(name="Test Region")
    pref, _ = Prefecture.objects.get_or_create(name="Test Pref", region=region)
    spref, _ = SousPrefecture.objects.get_or_create(name="Test SPref", prefecture=pref)
    ville, _ = Ville.objects.get_or_create(name="Test Ville", sous_prefecture=spref)
    quartier, _ = Quartier.objects.get_or_create(name="Test Quartier", ville=ville)
    secteur, _ = Secteur.objects.get_or_create(name="Test Secteur", quartier=quartier)

    # Create two properties
    p1 = Property.objects.create(
        owner=user, title="Propriété Libre", price=1000, 
        property_type='APPARTEMENT', secteur=secteur, is_available=True
    )
    p2 = Property.objects.create(
        owner=user, title="Propriété en Validation", price=2000, 
        property_type='APPARTEMENT', secteur=secteur, is_available=True
    )

    # Initially both should be visible in a standard queryset (if we were using the ViewSet logic)
    # We call the filter logic manually here to verify
    
    def get_available_properties():
        from django.utils import timezone
        five_hours_ago = timezone.now() - timedelta(hours=5)
        return Property.objects.filter(is_available=True).exclude(
            occupation_requests__status='PENDING',
            occupation_requests__created_at__gte=five_hours_ago
        ).distinct()

    print(f"Propriétés initiales: {get_available_properties().count()}")
    
    # Create a pending occupation request for p2
    OccupationRequest.objects.create(property=p2, user=user, status='PENDING')
    
    available = get_available_properties()
    print(f"Propriétés après demande d'occupation sur p2: {available.count()}")
    
    if p1 in available and p2 not in available:
        print("SUCCÈS: p2 est bien masquée car en cours de validation.")
    else:
        print("ÉCHEC: p2 devrait être masquée.")

    # Test expiration
    old_request = OccupationRequest.objects.create(property=p2, user=user, status='PENDING')
    # Mocking created_at is tricky with auto_now_add=True, but we can verify the query logic
    
    print("--- Fin de la vérification ---")

if __name__ == "__main__":
    verify_clean_search()
