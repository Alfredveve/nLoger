from properties.models import Property
props = Property.objects.all()
count = 0
for p in props:
    if 'Rentr' in p.title:
        old_title = p.title
        p.title = p.title.replace('Rentrée couchée', 'Rentrée Couchée')
        p.title = p.title.replace('Rentrée couch?e', 'Rentrée Couchée')
        # Handle various encoding glitches
        for corrupted in ['Rentr?e', 'Rentr\ufffd', 'Rentr\xe9e']:
            p.title = p.title.replace(corrupted, 'Rentrée')
        # Final cleanup for the specific term requested
        if 'Rentrée couchée' in p.title:
            p.title = p.title.replace('Rentrée couchée', 'Rentrée Couchée')
        
        if p.title != old_title:
            p.save()
            count += 1
            print(f"Updated: {old_title} -> {p.title}")
print(f"Total updated: {count}")
