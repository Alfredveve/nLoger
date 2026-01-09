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
    
    PAYMENT_STATUS_CHOICES = (
        ('UNPAID', 'Non payé'),
        ('PAID', 'Payé'),
        ('REFUNDED', 'Remboursé'),
    )

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='occupation_requests')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Champs de paiement
    requires_payment = models.BooleanField(default=True, help_text="Si ce logement nécessite un paiement")
    payment_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Montant à payer (calculé automatiquement)"
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='UNPAID'
    )
    payment_deadline = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date limite pour effectuer le paiement"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Demande {self.id} - {self.property.title} ({self.status})"
    
    def calculate_payment_amount(self):
        """Calcule le montant total à payer (loyer + frais éventuels)"""
        if not self.requires_payment:
            return 0
        # Pour l'instant, le montant est simplement le prix de la propriété
        # Peut être étendu pour inclure des frais supplémentaires
        return self.property.price

class VisitVoucher(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('VALIDATED', 'Validé (Visite effectuée)'),
        ('MISSED', 'Non honoré'),
        ('CANCELLED', 'Annulé'),
    )
    
    agent = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='visits_as_agent', on_delete=models.CASCADE)
    visitor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='visits_as_visitor', on_delete=models.CASCADE)
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='visits')
    
    scheduled_at = models.DateTimeField()
    validation_code = models.CharField(max_length=6, help_text="Code à 6 chiffres à valider lors de la visite")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    validated_at = models.DateTimeField(null=True, blank=True, help_text="Date et heure de validation de la visite")
    
    # Feedback/Rating (Phase 3 anticipation)
    rating = models.IntegerField(null=True, blank=True, help_text="Note sur 5")
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visite {self.property.title} - {self.visitor.username} ({self.scheduled_at})"
