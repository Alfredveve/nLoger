from django.db import models
from django.conf import settings
from properties.models import Property

class OccupationRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente de validation'),
        ('VALIDATED', 'Validé (Occupé)'),
        ('CANCELLED', 'Annulé'),
        ('EXPIRED', 'Expiré'),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='occupation_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Demande {self.id} - {self.property.title} ({self.status})"
