import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from accounts.models import User

# Find user veve
try:
    veve = User.objects.get(username='veve')
    print(f"User found: {veve.username}")
    print(f"Current roles: {veve.roles}")
    print(f"is_demarcheur: {veve.is_demarcheur}")
    print(f"is_proprietaire: {veve.is_proprietaire}")
    print(f"is_locataire: {veve.is_locataire}")
    
    # Update to demarcheur
    veve.roles = 'DEMARCHEUR'
    veve.is_demarcheur = True
    veve.is_proprietaire = False
    veve.is_locataire = False
    veve.save()
    
    print("\n✅ User updated successfully!")
    print(f"New roles: {veve.roles}")
    print(f"is_demarcheur: {veve.is_demarcheur}")
    print(f"is_proprietaire: {veve.is_proprietaire}")
    print(f"is_locataire: {veve.is_locataire}")
    
except User.DoesNotExist:
    print("❌ User 'veve' not found")
