"""
Intégration avec les fournisseurs de paiement mobile
"""
import hashlib
import hmac
import json
import requests
from abc import ABC, abstractmethod
from django.conf import settings


class BasePaymentProvider(ABC):
    """Classe de base pour tous les fournisseurs de paiement"""
    
    def __init__(self):
        self.api_key = None
        self.api_secret = None
        self.base_url = None
        self.sandbox_mode = getattr(settings, 'PAYMENT_SANDBOX_MODE', True)
    
    @abstractmethod
    def initiate_payment(self, amount, phone_number, reference, description=""):
        """
        Initie un paiement
        
        Args:
            amount: Montant à payer
            phone_number: Numéro de téléphone du payeur
            reference: Référence unique du paiement
            description: Description du paiement
            
        Returns:
            dict: Réponse du fournisseur avec transaction_id, status, etc.
        """
        pass
    
    @abstractmethod
    def verify_payment(self, transaction_id):
        """
        Vérifie le statut d'un paiement
        
        Args:
            transaction_id: ID de transaction du fournisseur
            
        Returns:
            dict: Statut du paiement
        """
        pass
    
    @abstractmethod
    def process_refund(self, transaction_id, amount):
        """
        Traite un remboursement
        
        Args:
            transaction_id: ID de la transaction originale
            amount: Montant à rembourser
            
        Returns:
            dict: Résultat du remboursement
        """
        pass
    
    @abstractmethod
    def verify_webhook_signature(self, payload, signature):
        """
        Vérifie la signature d'un webhook
        
        Args:
            payload: Données du webhook
            signature: Signature à vérifier
            
        Returns:
            bool: True si la signature est valide
        """
        pass


class OrangeMoneyProvider(BasePaymentProvider):
    """Intégration Orange Money"""
    
    def __init__(self):
        super().__init__()
        self.api_key = getattr(settings, 'ORANGE_MONEY_API_KEY', '')
        self.api_secret = getattr(settings, 'ORANGE_MONEY_API_SECRET', '')
        
        if self.sandbox_mode:
            self.base_url = 'https://api.orange.com/orange-money-webpay/dev/v1'
        else:
            self.base_url = 'https://api.orange.com/orange-money-webpay/gn/v1'
    
    def initiate_payment(self, amount, phone_number, reference, description=""):
        """Initie un paiement Orange Money"""
        
        # En mode sandbox/développement, on simule une réponse
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'transaction_id': f'OM-{reference}',
                'status': 'PENDING',
                'message': 'Paiement initié (mode simulation)',
                'ussd_code': '*144*4*6#',
                'payment_url': None
            }
        
        # Code réel d'intégration Orange Money
        endpoint = f'{self.base_url}/webpayment'
        
        payload = {
            'merchant_key': self.api_key,
            'currency': 'GNF',
            'order_id': reference,
            'amount': int(amount),
            'return_url': f'{settings.FRONTEND_URL}/payment/callback',
            'cancel_url': f'{settings.FRONTEND_URL}/payment/cancel',
            'notif_url': f'{settings.BACKEND_URL}/api/payments/webhook/orange/',
            'lang': 'fr',
            'reference': description
        }
        
        try:
            response = requests.post(endpoint, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return {
                'success': True,
                'transaction_id': data.get('pay_token'),
                'status': 'PENDING',
                'payment_url': data.get('payment_url'),
                'message': 'Paiement initié avec succès'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Erreur lors de l\'initiation du paiement'
            }
    
    def verify_payment(self, transaction_id):
        """Vérifie le statut d'un paiement Orange Money"""
        
        if self.sandbox_mode or not self.api_key:
            # Simulation: on retourne un paiement réussi
            return {
                'success': True,
                'status': 'COMPLETED',
                'transaction_id': transaction_id,
                'message': 'Paiement vérifié (mode simulation)'
            }
        
        endpoint = f'{self.base_url}/transactionstatus'
        
        payload = {
            'merchant_key': self.api_key,
            'pay_token': transaction_id
        }
        
        try:
            response = requests.post(endpoint, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return {
                'success': True,
                'status': data.get('status'),
                'transaction_id': transaction_id,
                'message': data.get('message', '')
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_refund(self, transaction_id, amount):
        """Traite un remboursement Orange Money"""
        
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'refund_id': f'REFUND-{transaction_id}',
                'message': 'Remboursement traité (mode simulation)'
            }
        
        # Implémentation réelle du remboursement
        # Note: Orange Money peut avoir des restrictions sur les remboursements
        return {
            'success': False,
            'message': 'Remboursement non implémenté pour Orange Money'
        }
    
    def verify_webhook_signature(self, payload, signature):
        """Vérifie la signature d'un webhook Orange Money"""
        
        if self.sandbox_mode:
            return True
        
        # Calculer la signature attendue
        message = json.dumps(payload, sort_keys=True)
        expected_signature = hmac.new(
            self.api_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)


class MTNMoneyProvider(BasePaymentProvider):
    """Intégration MTN Mobile Money"""
    
    def __init__(self):
        super().__init__()
        self.api_key = getattr(settings, 'MTN_MONEY_API_KEY', '')
        self.api_secret = getattr(settings, 'MTN_MONEY_API_SECRET', '')
        
        if self.sandbox_mode:
            self.base_url = 'https://sandbox.momodeveloper.mtn.com'
        else:
            self.base_url = 'https://momodeveloper.mtn.com'
    
    def initiate_payment(self, amount, phone_number, reference, description=""):
        """Initie un paiement MTN Mobile Money"""
        
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'transaction_id': f'MTN-{reference}',
                'status': 'PENDING',
                'message': 'Paiement initié (mode simulation)',
                'ussd_code': '*182*7*1#'
            }
        
        # Implémentation réelle MTN MoMo
        # À compléter selon la documentation MTN
        return {
            'success': False,
            'message': 'MTN Mobile Money non encore implémenté'
        }
    
    def verify_payment(self, transaction_id):
        """Vérifie le statut d'un paiement MTN"""
        
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'status': 'COMPLETED',
                'transaction_id': transaction_id
            }
        
        return {'success': False, 'message': 'Non implémenté'}
    
    def process_refund(self, transaction_id, amount):
        """Traite un remboursement MTN"""
        
        if self.sandbox_mode:
            return {
                'success': True,
                'refund_id': f'REFUND-{transaction_id}'
            }
        
        return {'success': False, 'message': 'Non implémenté'}
    
    def verify_webhook_signature(self, payload, signature):
        """Vérifie la signature d'un webhook MTN"""
        return True if self.sandbox_mode else False


class WaveProvider(BasePaymentProvider):
    """Intégration Wave"""
    
    def __init__(self):
        super().__init__()
        self.api_key = getattr(settings, 'WAVE_API_KEY', '')
        self.api_secret = getattr(settings, 'WAVE_API_SECRET', '')
        
        if self.sandbox_mode:
            self.base_url = 'https://api-sandbox.wave.com'
        else:
            self.base_url = 'https://api.wave.com'
    
    def initiate_payment(self, amount, phone_number, reference, description=""):
        """Initie un paiement Wave"""
        
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'transaction_id': f'WAVE-{reference}',
                'status': 'PENDING',
                'message': 'Paiement initié (mode simulation)'
            }
        
        # Implémentation réelle Wave
        return {
            'success': False,
            'message': 'Wave non encore implémenté'
        }
    
    def verify_payment(self, transaction_id):
        """Vérifie le statut d'un paiement Wave"""
        
        if self.sandbox_mode or not self.api_key:
            return {
                'success': True,
                'status': 'COMPLETED',
                'transaction_id': transaction_id
            }
        
        return {'success': False, 'message': 'Non implémenté'}
    
    def process_refund(self, transaction_id, amount):
        """Traite un remboursement Wave"""
        
        if self.sandbox_mode:
            return {
                'success': True,
                'refund_id': f'REFUND-{transaction_id}'
            }
        
        return {'success': False, 'message': 'Non implémenté'}
    
    def verify_webhook_signature(self, payload, signature):
        """Vérifie la signature d'un webhook Wave"""
        return True if self.sandbox_mode else False


# Factory pour obtenir le bon fournisseur
def get_payment_provider(provider_type):
    """
    Retourne une instance du fournisseur de paiement
    
    Args:
        provider_type: Type de fournisseur ('ORANGE_MONEY', 'MTN_MONEY', 'WAVE')
        
    Returns:
        Instance du fournisseur
    """
    providers = {
        'ORANGE_MONEY': OrangeMoneyProvider,
        'MTN_MONEY': MTNMoneyProvider,
        'WAVE': WaveProvider,
    }
    
    provider_class = providers.get(provider_type)
    if not provider_class:
        raise ValueError(f"Fournisseur de paiement inconnu: {provider_type}")
    
    return provider_class()
