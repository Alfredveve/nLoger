from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('DEMARCHEUR', 'Démarcheur'),
        ('PROPRIETAIRE', 'Propriétaire'),
        ('LOCATAIRE', 'Locataire'),
    )
    
    KYC_STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('VERIFIED', 'Vérifié'),
        ('REJECTED', 'Rejeté'),
    )
    
    phone = models.CharField(max_length=20, blank=True)
    roles = models.CharField(max_length=50, default='LOCATAIRE') # Peut être une liste séparée par des virgules ou M2M si complexe
    # Pour simplifier selon le besoin de "Proprio peut être démarcheur"
    is_demarcheur = models.BooleanField(default=False)
    is_proprietaire = models.BooleanField(default=False)
    is_locataire = models.BooleanField(default=True)
    
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='PENDING')
    kyc_validated_at = models.DateTimeField(null=True, blank=True)
    reputation_score = models.FloatField(default=5.0, help_text="Note de réputation sur 5")
    
    bio_document = models.FileField(upload_to='kyc_docs/', null=True, blank=True)
    contract_document = models.FileField(upload_to='kyc_docs/', null=True, blank=True)
    engagement_signed = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    @property
    def is_self_managed_owner(self):
        """
        Returns True if the user is a Property Owner who also manages their own properties 
        (acts as their own Demarcheur).
        """
        return self.is_proprietaire and self.is_demarcheur
    
    def __str__(self):
        return f"{self.username} ({self.email})"
