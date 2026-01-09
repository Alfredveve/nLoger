from properties.models import Property
from transactions.models import OccupationRequest
from django.utils import timezone
from datetime import timedelta

all_props = Property.objects.all()
available_props = Property.objects.filter(is_available=True)

five_hours_ago = timezone.now() - timedelta(hours=5)
under_validation = Property.objects.filter(
    occupation_requests__status='PENDING',
    occupation_requests__created_at__gte=five_hours_ago
).distinct()

ready_props = available_props.exclude(
    id__in=under_validation.values_list('id', flat=True)
)

print(f"Total properties: {all_props.count()}")
print(f"Available properties: {available_props.count()}")
print(f"Properties under validation: {under_validation.count()}")
print(f"Properties ready to show: {ready_props.count()}")

if all_props.count() > 0:
    print("\nSample properties:")
    for p in all_props[:5]:
        print(f"- ID: {p.id}, Title: {p.title}, Available: {p.is_available}, Secteur: {p.secteur.name if p.secteur else 'N/A'}")
else:
    print("\nNo properties found in database.")
