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
    bio_document = models.FileField(upload_to='kyc_docs/', null=True, blank=True)
    contract_document = models.FileField(upload_to='kyc_docs/', null=True, blank=True)
    engagement_signed = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.email})"
