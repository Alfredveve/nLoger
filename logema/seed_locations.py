import os
import django

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Region, Prefecture

def seed_guinea_locations():
    data = {
        "Conakry": ["Conakry"],
        "Boké": ["Boké", "Boffa", "Fria", "Gaoual", "Koundara"],
        "Kindia": ["Kindia", "Coyah", "Dubréka", "Forécariah", "Télimélé"],
        "Mamou": ["Mamou", "Dalaba", "Pita"],
        "Labé": ["Labé", "Koubia", "Lelouma", "Mali", "Tougué"],
        "Faranah": ["Faranah", "Dabola", "Dinguiraye", "Kissidougou"],
        "Kankan": ["Kankan", "Kérouané", "Kouroussa", "Mandiana", "Siguiri"],
        "Nzérékoré": ["Nzérékoré", "Beyla", "Guéckédou", "Lola", "Macenta", "Yomou"]
    }

    print("Début du peuplement des régions et préfectures...")
    for region_name, prefectures in data.items():
        region, created = Region.objects.get_or_create(name=region_name)
        if created:
            print(f"Région créée : {region_name}")
        
        for pref_name in prefectures:
            Prefecture.objects.get_or_create(name=pref_name, region=region)
            print(f"  - Préfecture : {pref_name}")

    print("Peuplement terminé avec succès !")

if __name__ == "__main__":
    seed_guinea_locations()
