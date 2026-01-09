import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property
from accounts.models import User

def seed_new_types():
    # 1. Get Region and Prefecture
    region, _ = Region.objects.get_or_create(name="Conakry")
    prefecture, _ = Prefecture.objects.get_or_create(name="Conakry", region=region)

    # 2. Define communes (Sous-Prefectures/Villes) with approx coordinates
    communes = [
        {"name": "Kaloum", "lat": 9.5097, "lng": -13.7122},
        {"name": "Dixinn", "lat": 9.5414, "lng": -13.6708},
        {"name": "Matam", "lat": 9.5444, "lng": -13.6528},
        {"name": "Ratoma", "lat": 9.6015, "lng": -13.6262},
        {"name": "Matoto", "lat": 9.5915, "lng": -13.5786},
    ]

    new_types = [
        ('VILLA', 'Villa', 15000000),
        ('STUDIO', 'Studio', 1500000),
        ('MAGASIN', 'Magasin', 2000000),
        ('BUREAU', 'Bureau', 5000000),
    ]

    owner = User.objects.filter(is_superuser=True).first() or User.objects.first()
    if not owner:
        print("No user found to assign as owner.")
        return

    for comm in communes:
        # Create hierarchy
        sp, _ = SousPrefecture.objects.get_or_create(name=comm["name"], prefecture=prefecture)
        v, _ = Ville.objects.get_or_create(name=comm["name"], sous_prefecture=sp)
        q, _ = Quartier.objects.get_or_create(name=f"{comm['name']} Centre", ville=v)
        s, _ = Secteur.objects.get_or_create(name=f"Secteur {comm['name']}", quartier=q)

        # Pick a random new type for each commune to spread them out
        for p_type, p_label, base_price in new_types:
            title = f"{p_label} de Luxe - {comm['name']}"
            price = base_price + random.randint(-500000, 500000)
            
            # Add small random offset to lat/lng for visibility on map
            offset_lat = (random.random() - 0.5) * 0.02
            offset_lng = (random.random() - 0.5) * 0.02

            prop, created = Property.objects.get_or_create(
                title=title,
                property_type=p_type,
                secteur=s,
                defaults={
                    'owner': owner,
                    'description': f"Superbe {p_label.lower()} de haut standing situé dans le quartier très prisé de {comm['name']}.",
                    'price': price,
                    'latitude': comm["lat"] + offset_lat,
                    'longitude': comm["lng"] + offset_lng,
                    'is_available': True
                }
            )
            if created:
                print(f"Created {title}")
            else:
                print(f"Already exists: {title}")

if __name__ == "__main__":
    seed_new_types()
