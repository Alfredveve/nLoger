import random
from accounts.models import User
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property

def seed_data():
    print("Starting corrected seeding process...")
    region_conakry, _ = Region.objects.get_or_create(name="Conakry")
    region_kindia, _ = Region.objects.get_or_create(name="Kindia")
    locations_config = {
        "Km 36": {"region": region_kindia, "prefecture": "Coyah", "sp": "Coyah", "ville": "Coyah", "lat": 9.7042, "lng": -13.3858},
        "Kagb\u00e9len": {"region": region_kindia, "prefecture": "Dubr\u00e9ka", "sp": "Dubr\u00e9ka", "ville": "Dubr\u00e9ka", "lat": 9.7719, "lng": -13.5233},
        "Cimenterie": {"region": region_conakry, "prefecture": "Conakry", "sp": "Ratoma", "ville": "Ratoma", "lat": 9.6800, "lng": -13.5700}
    }
    secteur_objs = {}
    for q_name, config in locations_config.items():
        pref, _ = Prefecture.objects.get_or_create(name=config["prefecture"], region=config["region"])
        sp, _ = SousPrefecture.objects.get_or_create(name=config["sp"], prefecture=pref)
        ville, _ = Ville.objects.get_or_create(name=config["ville"], sous_prefecture=sp)
        quartier, _ = Quartier.objects.get_or_create(name=q_name, ville=ville)
        secteur, _ = Secteur.objects.get_or_create(name=f"Secteur {q_name}", quartier=quartier)
        secteur_objs[q_name] = {"secteur": secteur, "lat": config["lat"], "lng": config["lng"]}
        print(f"Verified hierarchy for: {q_name}")
    demarcheurs_data = [
        ("Amadou Bobo", "BARRY", "abobobarry"),
        ("Michel Kolako", "BEAVOGUI", "mkolako"),
        ("Jeannette Gaou", "BEAVOGUI", "jgaou"),
        ("Mamadou Alimou", "DIALLO", "malimou"),
        ("Mariama Sira", "CAMARA", "msira"),
    ]
    users = []
    for first_name, last_name, username in demarcheurs_data:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'first_name': first_name, 'last_name': last_name, 'email': f"{username}@example.com", 'is_demarcheur': True, 'is_proprietaire': False, 'is_locataire': False, 'roles': 'DEMARCHEUR'}
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"Created d\u00e9marcheur: {first_name} {last_name}")
        else:
            user.is_demarcheur = True
            user.save()
            print(f"Verified d\u00e9marcheur: {first_name} {last_name}")
        users.append(user)
    property_types = [
        ('CHAMBRE_SIMPLE', 'Rentr\u00e9e Couch\u00e9e', 400000),
        ('SALON_CHAMBRE', 'Salon Chambre', 800000),
        ('APPARTEMENT', 'Appartement', 2500000),
    ]
    neighborhood_names = list(locations_config.keys())
    for i, user in enumerate(users):
        for j, (p_type, p_label, base_price) in enumerate(property_types):
            n_name = neighborhood_names[(i + j) % len(neighborhood_names)]
            loc_info = secteur_objs[n_name]
            title = f"{p_label} \u00e0 {n_name}"
            price = base_price + random.randint(-50000, 50000)
            lat = loc_info["lat"] + (random.random() - 0.5) * 0.01
            lng = loc_info["lng"] + (random.random() - 0.5) * 0.01
            Property.objects.get_or_create(
                title=title, agent=user, owner=user, property_type=p_type, secteur=loc_info["secteur"],
                defaults={'description': f"Magnifique {p_label.lower()} situ\u00e9 \u00e0 {n_name}, g\u00e9r\u00e9 par {user.get_full_name()}.", 'price': price, 'latitude': lat, 'longitude': lng, 'is_available': True}
            )
            print(f"Created property: {title} managed by {user.get_full_name()}")

seed_data()
