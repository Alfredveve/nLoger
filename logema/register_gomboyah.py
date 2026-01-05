import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property
from accounts.models import User

def register_data():
    # 1. Get or Create Location Hierarchy
    region, _ = Region.objects.get_or_create(name="Kindia")
    prefecture, _ = Prefecture.objects.get_or_create(name="Coyah", region=region)
    sous_prefecture, _ = SousPrefecture.objects.get_or_create(name="Coyah", prefecture=prefecture)
    ville, _ = Ville.objects.get_or_create(name="Coyah", sous_prefecture=sous_prefecture)
    quartier, _ = Quartier.objects.get_or_create(name="Gomboyah", ville=ville)
    secteur, _ = Secteur.objects.get_or_create(name="Gomboyah Mosquée", quartier=quartier)

    # 2. Get Owner
    owner = User.objects.filter(is_superuser=True).first()
    if not owner:
        print("No superuser found to assign as owner.")
        return

    # 3. Create Property
    prop, created = Property.objects.get_or_create(
        title="Chambre rentrée couchée - Gomboyah",
        owner=owner,
        defaults={
            'description': "Chambre simple (rentrée couchée) située à Gomboyah, juste à côté de la mosquée. Près de la route principale.",
            'property_type': 'CHAMBRE_SIMPLE',
            'price': 450000,
            'secteur': secteur,
            'latitude': 9.7244624,
            'longitude': -13.4581956,
            'address_details': "Près de la mosquée de Gomboyah",
            'is_available': True
        }
    )

    if created:
        print(f"Property '{prop.title}' created successfully in {secteur.name}.")
    else:
        print(f"Property '{prop.title}' already exists.")

if __name__ == "__main__":
    register_data()
