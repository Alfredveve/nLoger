
import os
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from accounts.models import User
from properties.models import ManagementMandate, Property
from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

def run():
    print("Starting data creation for Zeze Bea and Veve...")

    # 1. Create Users
    # ----------------
    
    # Create Owner: Zeze Bea
    zeze, created = User.objects.get_or_create(
        username='zeze_bea',
        defaults={
            'first_name': 'Zeze',
            'last_name': 'Bea',
            'email': 'zeze.bea@example.com',
            'is_proprietaire': True,
            'phone': '+224600000001',
            'kyc_status': 'VERIFIED'
        }
    )
    if created:
        zeze.set_password('demo1234')
        zeze.save()
        print("Created owner: Zeze Bea")
    else:
        print("Owner Zeze Bea already exists")

    # Create Demarcheur: veve
    veve, created = User.objects.get_or_create(
        username='veve',
        defaults={
            'first_name': 'Veve',
            'last_name': 'Demarcheur',
            'email': 'veve@nloger.gn',
            'is_demarcheur': True,
            'phone': '+224600000002',
            'kyc_status': 'VERIFIED'
        }
    )
    if created:
        veve.set_password('demo1234')
        veve.save()
        print("Created demarcheur: Veve")
    else:
        print("Demarcheur Veve already exists")

    # 2. Create Location Hierarchy for Faranah
    # ------------------------------------------
    
    # Region
    region, _ = Region.objects.get_or_create(name='Faranah')
    
    # Prefecture
    pref, _ = Prefecture.objects.get_or_create(name='Faranah', region=region)
    
    # SousPrefecture
    sous_pref, _ = SousPrefecture.objects.get_or_create(name='Faranah-Centre', prefecture=pref)
    
    # Ville
    ville, _ = Ville.objects.get_or_create(name='Faranah', sous_prefecture=sous_pref)
    
    # Quartier
    quartier, _ = Quartier.objects.get_or_create(name='Abattoir', ville=ville)
    
    # Secteur
    secteur, _ = Secteur.objects.get_or_create(name='Secteur 1', quartier=quartier)
    
    print(f"Location ensured: {region.name} > {pref.name} > {sous_pref.name} > {ville.name} > {quartier.name} > {secteur.name}")

    # 3. Create Property
    # ------------------
    
    property_obj, created = Property.objects.get_or_create(
        title='Appartement de Zeze',
        owner=zeze,
        defaults={
            'description': 'Bel appartement situé à Faranah, quartier Abattoir.',
            'property_type': 'APPARTEMENT',
            'price': Decimal('2500000'),
            'secteur': secteur,
            'is_available': True,
            # Assigning agent immediately as we establish the mandate next
            'agent': veve 
        }
    )
    if created:
        print(f"Created Property: {property_obj.title} in {secteur.name}")
    else:
        print(f"Property {property_obj.title} already exists")
        # Update agent if needed
        if property_obj.agent != veve:
            property_obj.agent = veve
            property_obj.save()
            print("Updated property agent to Veve")

    # 4. Create Management Mandate
    # ----------------------------
    
    mandate, created = ManagementMandate.objects.get_or_create(
        owner=zeze,
        property_type='APPARTEMENT',
        location_description='Faranah, Quartier Abattoir',
        defaults={
            'agent': veve,
            'property_description': property_obj.description,
            'expected_price': property_obj.price,
            'status': 'ACCEPTED',
            'owner_phone': zeze.phone
        }
    )
    
    if created:
        print(f"Created Mandate: Owner {zeze.username} -> Agent {veve.username} (Status: {mandate.status})")
    else:
        print(f"Mandate already exists (Status: {mandate.status})")
        if mandate.status != 'ACCEPTED':
            mandate.status = 'ACCEPTED'
            mandate.save()
            print("Updated mandate status to ACCEPTED")
            
    print("Data creation complete.")

if __name__ == "__main__":
    run()
