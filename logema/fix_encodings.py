import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'logema.settings')
django.setup()

from locations.models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from properties.models import Property

def fix_string(s):
    if not s:
        return s
    
    # Common corrupted patterns
    replacements = {
        'Kagb??len': 'Kagbélen',
        'KagbÃ©len': 'Kagbélen',
        'Dubr??ka': 'Dubréka',
        'DubrÃ©ka': 'Dubréka',
        'Nz??r??kor??': 'Nzérékoré',
        'NzÃ©rÃ©korÃ©': 'Nzérékoré',
        'Bok??': 'Boké',
        'BokÃ©': 'Boké',
        'Lab??': 'Labé',
        'LabÃ©': 'Labé',
        'Rentr??e Couch??e': 'Rentrée Couchée',
        'RentrÃ©e CouchÃ©e': 'Rentrée Couchée',
        'Selon chambre': 'Salon Chambre', # Typo fix while we are at it
        '??': 'à' # Generic fallback for 'à'
    }
    
    new_s = s
    for old, new in replacements.items():
        new_s = new_s.replace(old, new)
    
    return new_s

def fix_database():
    print("Fixing Encodings in Database...")
    
    # Models to fix
    models = [Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur]
    for model in models:
        for obj in model.objects.all():
            old_name = obj.name
            new_name = fix_string(old_name)
            if old_name != new_name:
                obj.name = new_name
                obj.save()
                print(f"[{model.__name__}] {old_name} -> {new_name}")

    # Property Titles and Descriptions
    for prop in Property.objects.all():
        updated = False
        
        old_title = prop.title
        new_title = fix_string(old_title)
        if old_title != new_title:
            prop.title = new_title
            updated = True
            
        old_desc = prop.description
        new_desc = fix_string(old_desc)
        if old_desc != new_desc:
            prop.description = new_desc
            updated = True
        
        if updated:
            prop.save()
            print(f"[Property] Fixed ID {prop.id}: {new_title}")

    print("Database cleanup complete!")

if __name__ == "__main__":
    fix_database()
