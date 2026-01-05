import random
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property
from accounts.models import User

def seed_conakry():
    region, _ = Region.objects.get_or_create(name="Conakry")
    prefecture, _ = Prefecture.objects.get_or_create(name="Conakry", region=region)
    communes = [
        {"name": "Kaloum", "lat": 9.5097, "lng": -13.7122},
        {"name": "Dixinn", "lat": 9.5414, "lng": -13.6708},
        {"name": "Matam", "lat": 9.5444, "lng": -13.6528},
        {"name": "Ratoma", "lat": 9.6015, "lng": -13.6262},
        {"name": "Matoto", "lat": 9.5915, "lng": -13.5786},
    ]
    types = [
        ('CHAMBRE_SIMPLE', 'Rentrée couchée', 400000),
        ('SALON_CHAMBRE', 'Selon chambre', 800000),
        ('APPARTEMENT', 'Appartement', 2500000),
    ]
    owner = User.objects.first()
    if not owner:
        print("No user found.")
        return
    for comm in communes:
        sp, _ = SousPrefecture.objects.get_or_create(name=comm["name"], prefecture=prefecture)
        v, _ = Ville.objects.get_or_create(name=comm["name"], sous_prefecture=sp)
        q, _ = Quartier.objects.get_or_create(name=f"{comm['name']} Centre", ville=v)
        s, _ = Secteur.objects.get_or_create(name=f"Secteur {comm['name']}", quartier=q)
        for p_type, p_label, base_price in types:
            title = f"{p_label} - {comm['name']}"
            price = base_price + random.randint(-50000, 50000)
            offset_lat = (random.random() - 0.5) * 0.03
            offset_lng = (random.random() - 0.5) * 0.03
            Property.objects.get_or_create(
                title=title,
                owner=owner,
                property_type=p_type,
                secteur=s,
                defaults={
                    'description': f"Magnifique {p_label.lower()} situé au coeur de {comm['name']}.",
                    'price': price,
                    'latitude': comm["lat"] + offset_lat,
                    'longitude': comm["lng"] + offset_lng,
                    'is_available': True
                }
            )
            print(f"Created/Verified {title}")

seed_conakry()
