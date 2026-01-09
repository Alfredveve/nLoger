from rest_framework import serializers
from .models import (
    Payment,
    EscrowAccount,
    PaymentDistribution,
    Transaction,
    PaymentMethod,
    PaymentDispute
)
from transactions.models import OccupationRequest


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer pour les méthodes de paiement"""
    
    method_type_display = serializers.CharField(source='get_method_type_display', read_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'method_type',
            'method_type_display',
            'phone_number',
            'is_default',
            'is_verified',
            'nickname',
            'created_at',
            'last_used_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_used_at', 'is_verified']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique des transactions"""
    
    transaction_type_display = serializers.CharField(source='get_transaction_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id',
            'payment',
            'transaction_type',
            'transaction_type_display',
            'amount',
            'status',
            'status_display',
            'description',
            'error_message',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PaymentDistributionSerializer(serializers.ModelSerializer):
    """Serializer pour les distributions de paiement"""
    
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    distribution_type_display = serializers.CharField(source='get_distribution_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PaymentDistribution
        fields = [
            'id',
            'payment',
            'recipient',
            'recipient_username',
            'amount',
            'distribution_type',
            'distribution_type_display',
            'status',
            'status_display',
            'created_at',
            'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class EscrowAccountSerializer(serializers.ModelSerializer):
    """Serializer pour les comptes escrow"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_id = serializers.UUIDField(source='payment.id', read_only=True)
    
    class Meta:
        model = EscrowAccount
        fields = [
            'id',
            'payment',
            'payment_id',
            'held_amount',
            'status',
            'status_display',
            'held_at',
            'release_scheduled_date',
            'released_at',
            'refund_reason'
        ]
        read_only_fields = ['id', 'held_at', 'released_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer principal pour les paiements"""
    
    payer_username = serializers.CharField(source='payer.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    # Relations imbriquées
    escrow = EscrowAccountSerializer(read_only=True)
    distributions = PaymentDistributionSerializer(many=True, read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    
    # Informations de la demande d'occupation
    property_title = serializers.CharField(source='occupation_request.property.title', read_only=True)
    property_id = serializers.IntegerField(source='occupation_request.property.id', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'occupation_request',
            'payer',
            'payer_username',
            'amount',
            'currency',
            'status',
            'status_display',
            'payment_method',
            'payment_method_display',
            'transaction_id',
            'provider_reference',
            'payment_phone',
            'description',
            'created_at',
            'updated_at',
            'completed_at',
            'escrow',
            'distributions',
            'transactions',
            'property_title',
            'property_id'
        ]
        read_only_fields = [
            'id',
            'payer',
            'transaction_id',
            'provider_reference',
            'created_at',
            'updated_at',
            'completed_at'
        ]


class PaymentInitiationSerializer(serializers.Serializer):
    """Serializer pour initier un paiement"""
    
    occupation_request_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    payment_phone = serializers.CharField(max_length=20)
    save_payment_method = serializers.BooleanField(default=False, required=False)
    
    def validate_occupation_request_id(self, value):
        """Valider que la demande d'occupation existe"""
        try:
            occupation = OccupationRequest.objects.get(id=value)
            
            # Vérifier que l'utilisateur est bien le demandeur
            request = self.context.get('request')
            if occupation.user != request.user:
                raise serializers.ValidationError("Vous n'êtes pas autorisé à payer pour cette demande")
            
            # Vérifier que la demande n'est pas déjà payée
            if occupation.payment_status == 'PAID':
                raise serializers.ValidationError("Cette demande a déjà été payée")
            
            return value
        except OccupationRequest.DoesNotExist:
            raise serializers.ValidationError("Demande d'occupation introuvable")


class PaymentDisputeSerializer(serializers.ModelSerializer):
    """Serializer pour les litiges de paiement"""
    
    raised_by_username = serializers.CharField(source='raised_by.username', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    resolution_display = serializers.CharField(source='get_resolution_display', read_only=True, allow_null=True)
    
    class Meta:
        model = PaymentDispute
        fields = [
            'id',
            'payment',
            'raised_by',
            'raised_by_username',
            'reason',
            'status',
            'status_display',
            'resolution',
            'resolution_display',
            'resolution_notes',
            'resolved_by',
            'resolved_by_username',
            'created_at',
            'updated_at',
            'resolved_at'
        ]
        read_only_fields = [
            'id',
            'raised_by',
            'resolved_by',
            'created_at',
            'updated_at',
            'resolved_at'
        ]
