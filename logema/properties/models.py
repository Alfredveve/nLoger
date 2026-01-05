from django.db import models
from django.conf import settings
from locations.models import Secteur

class Property(models.Model):
    TYPE_CHOICES = (
        ('CHAMBRE_SIMPLE', 'Rentrée couchée'),
        ('SALON_CHAMBRE', 'Selon chambre'),
        ('APPARTEMENT', 'Appartement'),
    )
    
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties_owned')
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='properties_managed')
    
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

    def __str__(self):
        return f"{self.title} - {self.property_type}"

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=100, blank=True)
