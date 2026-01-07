from accounts.models import User
from properties.models import ManagementMandate, Property
from decimal import Decimal

def run():
    print("Starting mandate creation for Soul...")
    
    # Get or create Soul
    soul, created = User.objects.get_or_create(
        username='Soul',
        defaults={
            'first_name': 'Soul',
            'last_name': 'Agent',
            'email': 'soul@nloger.gn',
            'is_demarcheur': True,
            'kyc_status': 'VERIFIED'
        }
    )
    if created:
        soul.set_password('demo1234')
        soul.save()
        print("Created user Soul.")
    else:
        print("User Soul already exists.")

    # Create Owner 1
    owner1, created = User.objects.get_or_create(
        username='proprietaire_diallo',
        defaults={
            'first_name': 'Moussa',
            'last_name': 'Diallo',
            'email': 'diallo.moussa@example.com',
            'is_proprietaire': True,
            'phone': '+224620112233'
        }
    )
    if created:
        owner1.set_password('demo1234')
        owner1.save()
        print("Created owner 1.")

    # Create Owner 2
    owner2, created = User.objects.get_or_create(
        username='proprietaire_camara',
        defaults={
            'first_name': 'Fatoumata',
            'last_name': 'Camara',
            'email': 'fatou.camara@example.com',
            'is_proprietaire': True,
            'phone': '+224620445566'
        }
    )
    if created:
        owner2.set_password('demo1234')
        owner2.save()
        print("Created owner 2.")

    # Mandate 1: Pending
    mandate1, created = ManagementMandate.objects.get_or_create(
        owner=owner1,
        property_type='APPARTEMENT',
        location_description='Conakry, Ratoma, Lambandji near the bakery',
        defaults={
            'agent': soul,
            'property_description': 'Modern apartment with 3 bedrooms, 2 bathrooms, balcony.',
            'expected_price': Decimal('5500000'),
            'status': 'PENDING',
            'owner_phone': owner1.phone
        }
    )
    if created:
        print(f"Created mandate 1 for {owner1.username} assigned to Soul (Pending).")

    # Mandate 2: Accepted
    mandate2, created = ManagementMandate.objects.get_or_create(
        owner=owner2,
        property_type='SALON_CHAMBRE',
        location_description='Kankan, Quartier Bordeaux near the hospital',
        defaults={
            'agent': soul,
            'property_description': 'Spacious studio, recently renovated, secure area.',
            'expected_price': Decimal('1200000'),
            'status': 'ACCEPTED',
            'owner_phone': owner2.phone
        }
    )
    if created:
        print(f"Created mandate 2 for {owner2.username} assigned to Soul (Accepted).")

    # Mandate 3: Completed
    mandate3, created = ManagementMandate.objects.get_or_create(
        owner=owner1,
        property_type='CHAMBRE_SIMPLE',
        location_description='Mamou center, near the station',
        defaults={
            'agent': soul,
            'property_description': 'Clean room, shared kitchen and bathroom.',
            'expected_price': Decimal('450000'),
            'status': 'COMPLETED',
            'owner_phone': owner1.phone
        }
    )
    if created:
        print(f"Created mandate 3 for {owner1.username} assigned to Soul (Completed).")

    print("Finished mandate creation.")

if __name__ == "__main__":
    run()
