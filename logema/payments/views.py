from django.utils import timezone
from django.db import transaction as db_transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import (
    Payment,
    EscrowAccount,
    PaymentDistribution,
    Transaction,
    PaymentMethod,
    PaymentDispute
)
from .serializers import (
    PaymentSerializer,
    PaymentInitiationSerializer,
    EscrowAccountSerializer,
    PaymentDistributionSerializer,
    TransactionSerializer,
    PaymentMethodSerializer,
    PaymentDisputeSerializer
)
from .payment_providers import get_payment_provider
from .escrow_manager import EscrowManager
from transactions.models import OccupationRequest


class PaymentViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des paiements"""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Les utilisateurs ne voient que leurs propres paiements"""
        user = self.request.user
        
        # Admin voit tout
        if user.is_staff:
            return Payment.objects.all()
        
        # Les utilisateurs voient leurs paiements effectués ou reçus
        return Payment.objects.filter(payer=user) | Payment.objects.filter(
            occupation_request__property__owner=user
        ) | Payment.objects.filter(
            occupation_request__property__agent=user
        )
    
    @action(detail=False, methods=['post'])
    def initiate(self, request):
        """
        Initie un nouveau paiement
        POST /api/payments/initiate/
        """
        serializer = PaymentInitiationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        occupation_id = serializer.validated_data['occupation_request_id']
        payment_method = serializer.validated_data['payment_method']
        payment_phone = serializer.validated_data['payment_phone']
        save_method = serializer.validated_data.get('save_payment_method', False)
        
        try:
            with db_transaction.atomic():
                # Récupérer la demande d'occupation
                occupation = OccupationRequest.objects.get(id=occupation_id)
                
                # Calculer le montant
                if not occupation.payment_amount:
                    occupation.payment_amount = occupation.calculate_payment_amount()
                    occupation.save()
                
                # Créer le paiement
                payment = Payment.objects.create(
                    occupation_request=occupation,
                    payer=request.user,
                    amount=occupation.payment_amount,
                    currency='GNF',
                    payment_method=payment_method,
                    payment_phone=payment_phone,
                    status='PENDING',
                    description=f"Paiement pour {occupation.property.title}"
                )
                
                # Initier le paiement avec le fournisseur
                provider = get_payment_provider(payment_method)
                result = provider.initiate_payment(
                    amount=float(payment.amount),
                    phone_number=payment_phone,
                    reference=str(payment.id),
                    description=payment.description
                )
                
                # Mettre à jour le paiement avec la réponse du fournisseur
                if result.get('success'):
                    payment.status = 'PROCESSING'
                    payment.transaction_id = result.get('transaction_id')
                    payment.provider_reference = result.get('transaction_id')
                    payment.provider_response = result
                    payment.save()
                    
                    # Créer une transaction
                    Transaction.objects.create(
                        payment=payment,
                        transaction_type='PAYMENT',
                        amount=payment.amount,
                        status='PROCESSING',
                        description="Paiement initié",
                        provider_response=result
                    )
                    
                    # Sauvegarder la méthode de paiement si demandé
                    if save_method:
                        PaymentMethod.objects.get_or_create(
                            user=request.user,
                            method_type=payment_method,
                            phone_number=payment_phone,
                            defaults={'is_verified': False}
                        )
                    
                    return Response({
                        'success': True,
                        'payment_id': payment.id,
                        'transaction_id': payment.transaction_id,
                        'status': payment.status,
                        'message': result.get('message'),
                        'ussd_code': result.get('ussd_code'),
                        'payment_url': result.get('payment_url')
                    }, status=status.HTTP_201_CREATED)
                else:
                    payment.status = 'FAILED'
                    payment.provider_response = result
                    payment.save()
                    
                    Transaction.objects.create(
                        payment=payment,
                        transaction_type='PAYMENT',
                        amount=payment.amount,
                        status='FAILED',
                        description="Échec de l'initiation",
                        error_message=result.get('message', 'Erreur inconnue'),
                        provider_response=result
                    )
                    
                    return Response({
                        'success': False,
                        'message': result.get('message', 'Erreur lors de l\'initiation du paiement')
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """
        Vérifie le statut d'un paiement auprès du fournisseur
        POST /api/payments/{id}/verify/
        """
        payment = self.get_object()
        
        if not payment.transaction_id:
            return Response({
                'success': False,
                'message': 'Aucun ID de transaction disponible'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            provider = get_payment_provider(payment.payment_method)
            result = provider.verify_payment(payment.transaction_id)
            
            if result.get('success'):
                # Mettre à jour le statut du paiement
                provider_status = result.get('status')
                
                if provider_status == 'COMPLETED' and payment.status != 'HELD_IN_ESCROW':
                    # Paiement réussi, placer en escrow
                    payment.status = 'PROCESSING'
                    payment.save()
                    
                    # Créer le compte escrow
                    escrow = EscrowManager.hold_payment(payment)
                    
                    return Response({
                        'success': True,
                        'status': payment.status,
                        'message': 'Paiement vérifié et placé en escrow',
                        'escrow_id': escrow.id
                    })
                
                return Response({
                    'success': True,
                    'status': payment.status,
                    'provider_status': provider_status,
                    'message': result.get('message', 'Paiement vérifié')
                })
            else:
                return Response({
                    'success': False,
                    'message': result.get('message', 'Erreur de vérification')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Annule un paiement en attente
        POST /api/payments/{id}/cancel/
        """
        payment = self.get_object()
        
        # Vérifier que l'utilisateur est le payeur
        if payment.payer != request.user:
            return Response({
                'success': False,
                'message': 'Non autorisé'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # On ne peut annuler que les paiements en attente ou en cours
        if payment.status not in ['PENDING', 'PROCESSING']:
            return Response({
                'success': False,
                'message': 'Ce paiement ne peut pas être annulé'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        payment.status = 'CANCELLED'
        payment.save()
        
        Transaction.objects.create(
            payment=payment,
            transaction_type='PAYMENT',
            amount=payment.amount,
            status='CANCELLED',
            description='Paiement annulé par l\'utilisateur'
        )
        
        return Response({
            'success': True,
            'message': 'Paiement annulé'
        })


class EscrowViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour consulter les comptes escrow"""
    
    serializer_class = EscrowAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Les utilisateurs voient les escrows liés à leurs paiements"""
        user = self.request.user
        
        if user.is_staff:
            return EscrowAccount.objects.all()
        
        return EscrowAccount.objects.filter(payment__payer=user) | EscrowAccount.objects.filter(
            payment__occupation_request__property__owner=user
        ) | EscrowAccount.objects.filter(
            payment__occupation_request__property__agent=user
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def release(self, request, pk=None):
        """
        Libère les fonds d'un escrow (admin uniquement)
        POST /api/escrow/{id}/release/
        """
        escrow = self.get_object()
        
        try:
            distributions = EscrowManager.release_payment(escrow)
            
            return Response({
                'success': True,
                'message': 'Fonds libérés avec succès',
                'distributions_count': len(distributions)
            })
        except ValueError as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def request_refund(self, request, pk=None):
        """
        Demande un remboursement
        POST /api/escrow/{id}/request-refund/
        Body: { "reason": "..." }
        """
        escrow = self.get_object()
        reason = request.data.get('reason', '')
        
        # Vérifier que l'utilisateur est le payeur
        if escrow.payment.payer != request.user:
            return Response({
                'success': False,
                'message': 'Non autorisé'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Créer un litige
            dispute = PaymentDispute.objects.create(
                payment=escrow.payment,
                raised_by=request.user,
                reason=reason,
                status='OPEN'
            )
            
            return Response({
                'success': True,
                'message': 'Demande de remboursement créée',
                'dispute_id': dispute.id
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour l'historique des transactions"""
    
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Les utilisateurs voient leurs transactions"""
        user = self.request.user
        
        if user.is_staff:
            return Transaction.objects.all()
        
        return Transaction.objects.filter(payment__payer=user) | Transaction.objects.filter(
            payment__occupation_request__property__owner=user
        ) | Transaction.objects.filter(
            payment__occupation_request__property__agent=user
        )


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet pour les méthodes de paiement"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Les utilisateurs voient uniquement leurs méthodes"""
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Associer la méthode à l'utilisateur connecté"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """
        Définir une méthode comme par défaut
        POST /api/payment-methods/{id}/set-default/
        """
        payment_method = self.get_object()
        payment_method.is_default = True
        payment_method.save()
        
        return Response({
            'success': True,
            'message': 'Méthode définie par défaut'
        })


class PaymentDisputeViewSet(viewsets.ModelViewSet):
    """ViewSet pour les litiges de paiement"""
    
    serializer_class = PaymentDisputeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Les utilisateurs voient leurs litiges"""
        user = self.request.user
        
        if user.is_staff:
            return PaymentDispute.objects.all()
        
        return PaymentDispute.objects.filter(raised_by=user)
    
    def perform_create(self, serializer):
        """Associer le litige à l'utilisateur"""
        serializer.save(raised_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        """
        Résoudre un litige (admin uniquement)
        POST /api/disputes/{id}/resolve/
        Body: { "resolution": "REFUND_FULL", "notes": "..." }
        """
        dispute = self.get_object()
        resolution = request.data.get('resolution')
        notes = request.data.get('notes', '')
        
        if resolution not in dict(PaymentDispute.RESOLUTION_CHOICES):
            return Response({
                'success': False,
                'message': 'Résolution invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with db_transaction.atomic():
                dispute.status = 'RESOLVED'
                dispute.resolution = resolution
                dispute.resolution_notes = notes
                dispute.resolved_by = request.user
                dispute.resolved_at = timezone.now()
                dispute.save()
                
                # Si remboursement, traiter
                if resolution in ['REFUND_FULL', 'REFUND_PARTIAL']:
                    EscrowManager.process_refund(dispute.payment, reason=notes)
                
                return Response({
                    'success': True,
                    'message': 'Litige résolu'
                })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Erreur: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentWebhookView(APIView):
    """
    Endpoint pour recevoir les webhooks des fournisseurs de paiement
    POST /api/payments/webhook/{provider}/
    """
    permission_classes = []  # Pas d'authentification pour les webhooks
    
    def post(self, request, provider):
        """Traiter un webhook de paiement"""
        
        # Mapper le nom du fournisseur
        provider_map = {
            'orange': 'ORANGE_MONEY',
            'mtn': 'MTN_MONEY',
            'wave': 'WAVE'
        }
        
        provider_type = provider_map.get(provider.lower())
        if not provider_type:
            return Response({'error': 'Fournisseur inconnu'}, status=400)
        
        try:
            # Vérifier la signature du webhook
            signature = request.headers.get('X-Signature', '')
            provider_instance = get_payment_provider(provider_type)
            
            if not provider_instance.verify_webhook_signature(request.data, signature):
                return Response({'error': 'Signature invalide'}, status=403)
            
            # Traiter le webhook
            transaction_id = request.data.get('transaction_id')
            webhook_status = request.data.get('status')
            
            if transaction_id:
                # Trouver le paiement
                payment = Payment.objects.filter(transaction_id=transaction_id).first()
                
                if payment:
                    # Mettre à jour selon le statut
                    if webhook_status == 'COMPLETED' and payment.status == 'PROCESSING':
                        # Placer en escrow
                        EscrowManager.hold_payment(payment)
                    elif webhook_status == 'FAILED':
                        payment.status = 'FAILED'
                        payment.save()
                    
                    return Response({'success': True})
            
            return Response({'success': True, 'message': 'Webhook reçu'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
