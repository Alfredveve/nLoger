import os
import sys
import shutil
import django
import argparse
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from django.db import connection
from transactions.models import OccupationRequest, VisitVoucher
from payments.models import Payment, EscrowAccount, Transaction, PaymentDistribution, PaymentMethod, PaymentDispute
from properties.models import ManagementMandate
from accounts.models import User

BASE_DIR = Path(__file__).resolve().parent

def clear_media():
    print("🧹 Nettoyage des fichiers médias...")
    media_dirs = ['avatars', 'kyc_docs']
    for d in media_dirs:
        path = BASE_DIR / d
        if path.exists():
            for item in path.iterdir():
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
            print(f"  ✅ {d}/ nettoyé.")

def soft_reset():
    print("🔄 Démarrage de la Réinitialisation Partielle (Soft Reset)...")
    
    # Supprimer les interactions
    print("  🗑️ Suppression des demandes d'occupation...")
    OccupationRequest.objects.all().delete()
    
    print("  🗑️ Suppression des vouchers de visite...")
    VisitVoucher.objects.all().delete()
    
    print("  🗑️ Suppression des paiements et transactions...")
    Payment.objects.all().delete() # Cascade supprime Escrow, Transaction, Distribution, Dispute
    
    print("  🗑️ Suppression des méthodes de paiement...")
    PaymentMethod.objects.all().delete()
    
    print("  🗑️ Suppression des mandats de gestion...")
    ManagementMandate.objects.all().delete()
    
    clear_media()
    
    print("\n✨ RÉINITIALISATION PARTIELLE TERMINÉE !")
    print("Note: Les utilisateurs, les logements et les localisations ont été conservés.")

def full_reset():
    print("🔥 Démarrage de la Réinitialisation Complète (Full Reset)...")
    
    db_path = BASE_DIR / 'db.sqlite3'
    if db_path.exists():
        print(f"  🗑️ Suppression de la base de données: {db_path}")
        # On ferme les connexions avant de supprimer le fichier
        connection.close()
        try:
            db_path.unlink()
        except Exception as e:
            print(f"  ❌ Erreur lors de la suppression de la DB: {e}. Elle est peut-être utilisée par un autre processus.")
            return

    print("  🚀 Lancement des migrations...")
    os.system('python manage.py migrate')
    
    print("  👤 Création du superutilisateur par défaut (admin/admin)...")
    os.environ['DJANGO_SUPERUSER_PASSWORD'] = 'admin'
    os.system('python manage.py createsuperuser --noinput --username admin --email admin@example.com')
    
    print("  🌱 Peuplement des données initiales (Seeding)...")
    scripts = ['seed_conakry.py', 'seed_demarcheurs.py', 'seed_new_types.py']
    for script in scripts:
        if (BASE_DIR / script).exists():
            print(f"    ▶️ Exécution de {script}...")
            os.system(f'python {script}')
        else:
            print(f"    ⚠️ Script {script} non trouvé.")

    clear_media()
    
    print("\n✨ RÉINITIALISATION COMPLÈTE TERMINÉE !")
    print("Identifiants superutilisateur: admin / admin")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Outil de réinitialisation de l'application NLoger")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--soft', action='store_true', help="Réinitialisation partielle (garde users et properties)")
    group.add_argument('--full', action='store_true', help="Réinitialisation complète (efface tout)")
    
    args = parser.parse_args()
    
    if args.soft:
        soft_reset()
    elif args.full:
        full_reset()
