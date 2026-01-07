from django.core.management.base import BaseCommand
from properties.models import Property
import re

class Command(BaseCommand):
    help = 'Aggressively fixes accents and corrupted characters in property titles'

    def handle(self, *args, **options):
        self.stdout.write("Starting final cleanup of property titles...")
        props = Property.objects.all()
        count = 0
        
        for p in props:
            old_title = p.title
            new_title = p.title
            
            # Use unicode strings explicitly
            # Fix "Rentrée Couchée"
            # It might look like "Rentr??e couch??e" or "Rentr\ufffde Couch\ufffde"
            new_title = re.sub(r'Rentr[^\s]{1,5}e', 'Rentr\u00e9e', new_title)
            new_title = re.sub(r'[Cc]ouch[^\s]{1,5}e', 'Couch\u00e9e', new_title)
            
            # Clean up the weird " ?? " or " \ufffd\ufffd " that appears between words
            new_title = new_title.replace(" \ufffd\ufffd ", " \u00e0 ")
            new_title = new_title.replace(" ?? ", " \u00e0 ")
            new_title = new_title.replace(" \u00e0 \u00e0 ", " \u00e0 ") # Double cleanup
            
            # Fix locations
            new_title = re.sub(r'Kagb[^\s]{1,5}len', 'Kagb\u00e9len', new_title)
            
            # Final normalization
            new_title = new_title.replace("Rentr\u00e9e Couch\u00e9e", "Rentr\u00e9e Couch\u00e9e") # Case check
            new_title = new_title.replace("Rentr\u00e9e couch\u00e9e", "Rentr\u00e9e Couch\u00e9e")
            
            # Fix "Salon Chambre" typo from before
            new_title = new_title.replace("Selon chambre", "Salon Chambre")
            new_title = new_title.replace("Salon chambre", "Salon Chambre")

            if new_title != old_title:
                p.title = new_title
                p.save()
                count += 1
                self.stdout.write(self.style.SUCCESS(f"Fixed: {old_title} -> {new_title}"))

        self.stdout.write(self.style.SUCCESS(f"Finished. Total fixed: {count}"))
