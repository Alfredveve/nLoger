from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal
import uuid


class Payment(models.Model):
    """Modèle principal pour les paiements avec système d'escrow"""
    
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('PROCESSING', 'En cours de traitement'),
        ('HELD_IN_ESCROW', 'Retenu en séquestre'),
        ('RELEASED', 'Fonds libérés'),
        ('REFUNDED', 'Remboursé'),
        ('FAILED', 'Échoué'),
        ('CANCELLED', 'Annulé'),
    )
    
    PAYMENT_METHOD_CHOICES = (
        ('ORANGE_MONEY', 'Orange Money'),
        ('MTN_MONEY', 'MTN Mobile Money'),
        ('WAVE', 'Wave'),
        ('BANK_TRANSFER', 'Virement bancaire'),
        ('CASH', 'Espèces'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    occupation_request = models.ForeignKey(
        'transactions.OccupationRequest',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    payer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments_made'
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='GNF')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    
    # Informations de transaction du fournisseur
    transaction_id = models.CharField(max_length=255, blank=True, help_text="ID de transaction du fournisseur")
    provider_reference = models.CharField(max_length=255, blank=True)
    provider_response = models.JSONField(null=True, blank=True, help_text="Réponse complète du fournisseur")
    
    # Métadonnées
    payment_phone = models.CharField(max_length=20, blank=True, help_text="Numéro utilisé pour le paiement")
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payer', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"Paiement {self.id} - {self.amount} {self.currency} ({self.get_status_display()})"


class EscrowAccount(models.Model):
    """Compte de séquestre pour retenir les fonds jusqu'à validation"""
    
    STATUS_CHOICES = (
        ('HOLDING', 'Fonds retenus'),
        ('RELEASED', 'Fonds libérés'),
        ('REFUNDED', 'Remboursé'),
    )
    
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='escrow')
    
    held_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='HOLDING')
    
    # Dates importantes
    held_at = models.DateTimeField(auto_now_add=True)
    release_scheduled_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date prévue de libération automatique"
    )
    released_at = models.DateTimeField(null=True, blank=True)
    
    # Raison de remboursement si applicable
    refund_reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-held_at']
    
    def __str__(self):
        return f"Escrow {self.payment.id} - {self.held_amount} ({self.get_status_display()})"


class PaymentDistribution(models.Model):
    """Distribution des fonds aux différents bénéficiaires"""
    
    DISTRIBUTION_TYPE_CHOICES = (
        ('OWNER_PAYMENT', 'Paiement propriétaire'),
        ('AGENT_COMMISSION', 'Commission agent'),
        ('PLATFORM_FEE', 'Frais de plateforme'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('PROCESSING', 'En cours'),
        ('COMPLETED', 'Complété'),
        ('FAILED', 'Échoué'),
    )
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='distributions')
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_distributions_received'
    )
    
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    distribution_type = models.CharField(max_length=20, choices=DISTRIBUTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Informations de transfert
    transfer_reference = models.CharField(max_length=255, blank=True)
    transfer_response = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_distribution_type_display()} - {self.amount} pour {self.recipient.username}"


class Transaction(models.Model):
    """Historique détaillé de toutes les transactions"""
    
    TRANSACTION_TYPE_CHOICES = (
        ('PAYMENT', 'Paiement'),
        ('REFUND', 'Remboursement'),
        ('COMMISSION', 'Commission'),
        ('TRANSFER', 'Transfert'),
        ('FEE', 'Frais'),
    )
    
    STATUS_CHOICES = (
        ('PENDING', 'En attente'),
        ('PROCESSING', 'En cours'),
        ('COMPLETED', 'Complété'),
        ('FAILED', 'Échoué'),
        ('CANCELLED', 'Annulé'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Détails de la transaction
    description = models.TextField(blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment', '-created_at']),
            models.Index(fields=['transaction_type', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.amount} ({self.get_status_display()})"


class PaymentMethod(models.Model):
    """Méthodes de paiement enregistrées par les utilisateurs"""
    
    METHOD_TYPE_CHOICES = (
        ('ORANGE_MONEY', 'Orange Money'),
        ('MTN_MONEY', 'MTN Mobile Money'),
        ('WAVE', 'Wave'),
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payment_methods'
    )
    
    method_type = models.CharField(max_length=20, choices=METHOD_TYPE_CHOICES)
    phone_number = models.CharField(max_length=20)
    
    is_default = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Métadonnées
    nickname = models.CharField(max_length=50, blank=True, help_text="Ex: Mon Orange Money principal")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-is_default', '-last_used_at']
        unique_together = ['user', 'method_type', 'phone_number']
    
    def save(self, *args, **kwargs):
        # Si cette méthode est définie comme par défaut, retirer le défaut des autres
        if self.is_default:
            PaymentMethod.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.get_method_type_display()} - {self.phone_number} ({self.user.username})"


class PaymentDispute(models.Model):
    """Gestion des litiges de paiement"""
    
    STATUS_CHOICES = (
        ('OPEN', 'Ouvert'),
        ('INVESTIGATING', 'En cours d\'investigation'),
        ('RESOLVED', 'Résolu'),
        ('CLOSED', 'Fermé'),
    )
    
    RESOLUTION_CHOICES = (
        ('REFUND_FULL', 'Remboursement total'),
        ('REFUND_PARTIAL', 'Remboursement partiel'),
        ('NO_REFUND', 'Pas de remboursement'),
    )
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='disputes')
    raised_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='disputes_raised'
    )
    
    reason = models.TextField(help_text="Raison du litige")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    # Résolution
    resolution = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, blank=True)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='disputes_resolved'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Litige #{self.id} - Paiement {self.payment.id} ({self.get_status_display()})"
