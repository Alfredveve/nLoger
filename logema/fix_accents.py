import sys
# Ensure the output of this script can handle UTF-8 if needed
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from properties.models import Property

def fix_accents():
    print("Starting accent correction script...")
    props = Property.objects.all()
    count = 0
    
    # Target string with proper accents
    correct_term = "Rentrée Couchée"
    
    # Possible corrupted variations observed or expected
    corrupted_variations = [
        "Rentr?e couch?e",
        "Rentr\ufffde couch\ufffde",
        "Rentr\xc3\xa9e couch\xc3\xa9e",
        "entr\xc3\xa9e couch?e",
        "Rentr\xe9e couch\xe9e",
        "Rentr\ufffde Couch\ufffde",
        "Rentrée couchée",
        "Rentr\ufffde",
        "couch\ufffde",
        "Rentr?e",
        "couch?e"
    ]

    for p in props:
        old_title = p.title
        new_title = p.title
        
        # 1. Fix the Title
        for variant in corrupted_variations:
            # Simple substring replacement
            if variant in new_title:
                new_title = new_title.replace(variant, correct_term)
        
        # Extra safety for any remaining fragments in current titles like "Rentrée couchée à Km 36"
        if "Rentrée" in new_title and "Couchée" not in new_title:
             new_title = new_title.replace("Rentrée couchée", correct_term)
             new_title = new_title.replace("Rentrée couch?e", correct_term)

        if new_title != old_title:
            p.title = new_title
            p.save()
            count += 1
            print(f"Updated Title: {old_title} -> {new_title}")

    print(f"Total properties updated: {count}")

if __name__ == "__main__":
    fix_accents()
