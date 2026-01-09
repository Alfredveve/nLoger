"""
Gestionnaire de logique Escrow pour retenir et libérer les paiements
"""
from django.utils import timezone
from django.db import transaction
from decimal import Decimal
from .models import EscrowAccount, PaymentDistribution, Transaction, Payment


class EscrowManager:
    """Gère le cycle de vie des paiements en escrow"""
    
    @staticmethod
    def hold_payment(payment):
        """
        Place un paiement en escrow (séquestre)
        
        Args:
            payment: Instance de Payment
            
        Returns:
            EscrowAccount créé
        """
        with transaction.atomic():
            # Créer le compte escrow
            escrow = EscrowAccount.objects.create(
                payment=payment,
                held_amount=payment.amount,
                status='HOLDING',
                release_scheduled_date=timezone.now() + timezone.timedelta(days=7)  # 7 jours par défaut
            )
            
            # Mettre à jour le statut du paiement
            payment.status = 'HELD_IN_ESCROW'
            payment.save()
            
            # Créer une transaction d'enregistrement
            Transaction.objects.create(
                payment=payment,
                transaction_type='PAYMENT',
                amount=payment.amount,
                status='COMPLETED',
                description=f"Fonds placés en escrow - {escrow.held_amount}"
            )
            
            return escrow
    
    @staticmethod
    def release_payment(escrow_account):
        """
        Libère les fonds d'un compte escrow et les distribue
        
        Args:
            escrow_account: Instance d'EscrowAccount
            
        Returns:
            Liste des PaymentDistribution créées
        """
        if escrow_account.status != 'HOLDING':
            raise ValueError("Ce compte escrow ne peut pas être libéré")
        
        with transaction.atomic():
            payment = escrow_account.payment
            
            # Calculer les distributions
            distributions = EscrowManager.calculate_distributions(payment)
            
            # Créer les distributions
            distribution_objects = []
            for dist_data in distributions:
                dist = PaymentDistribution.objects.create(
                    payment=payment,
                    recipient=dist_data['recipient'],
                    amount=dist_data['amount'],
                    distribution_type=dist_data['type'],
                    status='COMPLETED',
                    completed_at=timezone.now()
                )
                distribution_objects.append(dist)
                
                # Créer une transaction pour chaque distribution
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='TRANSFER',
                    amount=dist_data['amount'],
                    status='COMPLETED',
                    description=f"Distribution: {dist.get_distribution_type_display()} à {dist.recipient.username}"
                )
            
            # Mettre à jour l'escrow
            escrow_account.status = 'RELEASED'
            escrow_account.released_at = timezone.now()
            escrow_account.save()
            
            # Mettre à jour le paiement
            payment.status = 'RELEASED'
            payment.completed_at = timezone.now()
            payment.save()
            
            # Mettre à jour l'OccupationRequest
            occupation = payment.occupation_request
            occupation.payment_status = 'PAID'
            occupation.status = 'VALIDATED'
            occupation.save()
            
            return distribution_objects
    
    @staticmethod
    def calculate_distributions(payment):
        """
        Calcule comment distribuer les fonds
        
        Args:
            payment: Instance de Payment
            
        Returns:
            Liste de dictionnaires avec les informations de distribution
        """
        distributions = []
        occupation = payment.occupation_request
        property_obj = occupation.property
        
        total_amount = payment.amount
        
        # 1. Commission de l'agent (si applicable)
        agent_commission = Decimal('0')
        if property_obj.agent:
            # Commission de 10% par défaut (peut être configuré)
            commission_rate = Decimal('0.10')
            agent_commission = total_amount * commission_rate
            
            distributions.append({
                'recipient': property_obj.agent,
                'amount': agent_commission,
                'type': 'AGENT_COMMISSION'
            })
        
        # 2. Frais de plateforme (optionnel, 2% par exemple)
        platform_fee = total_amount * Decimal('0.02')
        # Pour l'instant, on ne crée pas de distribution pour les frais de plateforme
        # Ils seront déduits du paiement du propriétaire
        
        # 3. Paiement au propriétaire (montant restant)
        owner_payment = total_amount - agent_commission - platform_fee
        
        distributions.append({
            'recipient': property_obj.owner,
            'amount': owner_payment,
            'type': 'OWNER_PAYMENT'
        })
        
        return distributions
    
    @staticmethod
    def process_refund(payment, reason=""):
        """
        Traite un remboursement
        
        Args:
            payment: Instance de Payment
            reason: Raison du remboursement
            
        Returns:
            EscrowAccount mis à jour
        """
        try:
            escrow = payment.escrow
        except EscrowAccount.DoesNotExist:
            raise ValueError("Aucun compte escrow trouvé pour ce paiement")
        
        if escrow.status != 'HOLDING':
            raise ValueError("Ce paiement ne peut pas être remboursé")
        
        with transaction.atomic():
            # Mettre à jour l'escrow
            escrow.status = 'REFUNDED'
            escrow.refund_reason = reason
            escrow.released_at = timezone.now()
            escrow.save()
            
            # Mettre à jour le paiement
            payment.status = 'REFUNDED'
            payment.save()
            
            # Créer une transaction de remboursement
            Transaction.objects.create(
                payment=payment,
                transaction_type='REFUND',
                amount=payment.amount,
                status='COMPLETED',
                description=f"Remboursement: {reason}"
            )
            
            # Mettre à jour l'OccupationRequest
            occupation = payment.occupation_request
            occupation.payment_status = 'REFUNDED'
            occupation.status = 'CANCELLED'
            occupation.save()
            
            return escrow
    
    @staticmethod
    def auto_release_expired_escrows():
        """
        Libère automatiquement les escrows dont la date de libération est passée
        Cette fonction devrait être appelée par une tâche cron/celery
        
        Returns:
            Nombre d'escrows libérés
        """
        now = timezone.now()
        expired_escrows = EscrowAccount.objects.filter(
            status='HOLDING',
            release_scheduled_date__lte=now
        )
        
        count = 0
        for escrow in expired_escrows:
            try:
                EscrowManager.release_payment(escrow)
                count += 1
            except Exception as e:
                # Logger l'erreur mais continuer
                print(f"Erreur lors de la libération de l'escrow {escrow.id}: {e}")
        
        return count
