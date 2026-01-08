from django.db import models
from django.conf import settings
from locations.models import Secteur

class Property(models.Model):
    TYPE_CHOICES = (
        ('CHAMBRE_SIMPLE', 'Rentrée Couchée'),
        ('SALON_CHAMBRE', 'Salon Chambre'),
        ('APPARTEMENT', 'Appartement'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties_owned')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='properties_managed')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Location
    secteur = models.ForeignKey(Secteur, on_delete=models.PROTECT, related_name='properties')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    address_details = models.CharField(max_length=255, blank=True)
    
    # Specific Criteria
    religion_preference = models.CharField(max_length=100, blank=True, help_text="Ex: Musulman, Chrétien, Indifférent")
    ethnic_preference = models.CharField(max_length=100, blank=True, help_text="Critère ethnique éventuel")
    
    # Characteristics
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_under_validation(self):
        """
        Check if there is a pending occupation request within the last 5 hours.
        """
        from transactions.models import OccupationRequest
        from django.utils import timezone
        from datetime import timedelta
        
        five_hours_ago = timezone.now() - timedelta(hours=5)
        return self.occupation_requests.filter(
            status='PENDING',
            created_at__gte=five_hours_ago
        ).exists()

    def __str__(self):
        return f"{self.title} - {self.property_type}"

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=100, blank=True)

class ManagementMandate(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('ACCEPTED', 'Accepté'),
        ('REJECTED', 'Rejeté'),
        ('COMPLETED', 'Terminé'),
        ('CANCELLED', 'Annulé'),
    )
    
    MANDATE_TYPE_CHOICES = (
        ('EXCLUSIVE', 'Exclusif'),
        ('SIMPLE', 'Simple (Non-exclusif)'),
    )

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mandates_given')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='mandates_received')
    
    mandate_type = models.CharField(max_length=20, choices=MANDATE_TYPE_CHOICES, default='SIMPLE')
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=10.0, help_text="Pourcentage de commission (ex: 10%)")
    
    # Digital Signatures
    signature_owner = models.CharField(max_length=255, blank=True, help_text="Signature numérique du propriétaire")
    signature_agent = models.CharField(max_length=255, blank=True, help_text="Signature numérique du démarcheur")
    signed_at = models.DateTimeField(null=True, blank=True)
    
    property_type = models.CharField(max_length=20, choices=Property.TYPE_CHOICES)
    location_description = models.TextField(help_text="Description précise de l'emplacement du bien")
    property_description = models.TextField(help_text="Détails sur le bien (nombre de pièces, état, etc.)")
    expected_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    owner_phone = models.CharField(max_length=20, help_text="Numéro à contacter (WhatsApp ou direct)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mandat {self.id} ({self.get_mandate_type_display()}) - {self.owner.username} ({self.get_status_display()})"

