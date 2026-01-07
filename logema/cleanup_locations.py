import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property

def cleanup():
    # Find duplicate prefectures
    prefs = Prefecture.objects.values('name').annotate(count=django.db.models.Count('id')).filter(count__gt=1)
    
    for p_info in prefs:
        name = p_info['name']
        duplicates = list(Prefecture.objects.filter(name=name))
        keep = duplicates[0]
        to_delete = duplicates[1:]
        
        print(f"Fixing duplicate prefecture: {name}")
        for other in to_delete:
            # Re-link everything from 'other' to 'keep'
            # Hierarchical re-linking
            for sp in SousPrefecture.objects.filter(prefecture=other):
                sp.prefecture = keep
                sp.save()
            
            # Now we can safely delete the duplicate
            other.delete()
            print(f"  Deleted duplicate ID {other.id}")

    # Same for SousPrefecture if any
    sps = SousPrefecture.objects.values('name', 'prefecture').annotate(count=django.db.models.Count('id')).filter(count__gt=1)
    for sp_info in sps:
        name = sp_info['name']
        pref_id = sp_info['prefecture']
        duplicates = list(SousPrefecture.objects.filter(name=name, prefecture_id=pref_id))
        keep = duplicates[0]
        to_delete = duplicates[1:]
        
        print(f"Fixing duplicate sous-prefecture: {name}")
        for other in to_delete:
            for v in Ville.objects.filter(sous_prefecture=other):
                v.sous_prefecture = keep
                v.save()
            other.delete()

    # Same for Ville
    villes = Ville.objects.values('name', 'sous_prefecture').annotate(count=django.db.models.Count('id')).filter(count__gt=1)
    for v_info in villes:
        name = v_info['name']
        sp_id = v_info['sous_prefecture']
        duplicates = list(Ville.objects.filter(name=name, sous_prefecture_id=sp_id))
        keep = duplicates[0]
        to_delete = duplicates[1:]
        
        print(f"Fixing duplicate ville: {name}")
        for other in to_delete:
            for q in Quartier.objects.filter(ville=other):
                q.ville = keep
                q.save()
            other.delete()

    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup()
