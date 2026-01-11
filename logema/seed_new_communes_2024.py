import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Prefecture, SousPrefecture, Ville

def seed_new_communes():
    # 1. Get Prefectures
    try:
        coyah = Prefecture.objects.get(name='Coyah')
        dubreka = Prefecture.objects.get(name='Dubréka')
    except Prefecture.DoesNotExist as e:
        print(f"Error: Could not find Prefecture. {e}")
        return

    # 2. Define new Communes (SousPrefectures in our model)
    new_data = {
        'Coyah': [
            'Coyah-Urbaine',
            'Manéah',
            'Sanoyah',
            'Kouria'
        ],
        'Dubréka': [
            'Dubréka-Urbaine',
            'Kagbélen',
            'Maneayah',
            'Wassou',
            'Ouassou',
            'Badi'
        ]
    }

    for pref_name, sp_list in new_data.items():
        pref = coyah if pref_name == 'Coyah' else dubreka
        print(f"\nProcessing Prefecture: {pref_name}")
        
        for sp_name in sp_list:
            sp, created = SousPrefecture.objects.get_or_create(
                prefecture=pref,
                name=sp_name
            )
            if created:
                print(f"  [+] Created SousPrefecture: {sp_name}")
            else:
                print(f"  [.] Already exists: {sp_name}")
            
            # 3. Ensure each SousPrefecture has at least one Ville (Commune level city)
            # This is important for the frontend selectors
            ville, v_created = Ville.objects.get_or_create(
                sous_prefecture=sp,
                name=sp_name # By default, the main city of the commune has the same name
            )
            if v_created:
                print(f"    [+] Created Ville for it: {sp_name}")

if __name__ == '__main__':
    seed_new_communes()
    print("\nSeeding completed successfully.")
