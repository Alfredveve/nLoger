import requests
import base64
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class OrangeSMSService:
    def __init__(self):
        self.client_id = getattr(settings, 'ORANGE_SMS_CLIENT_ID', '')
        self.client_secret = getattr(settings, 'ORANGE_SMS_CLIENT_SECRET', '')
        # Le numéro de l'expéditeur doit être au format tel:+224000000000
        self.sender_number = getattr(settings, 'ORANGE_SMS_SENDER_NUMBER', '')
        self.token_url = "https://api.orange.com/oauth/v3/token"
        
        if self.sender_number:
            self.sms_url = f"https://api.orange.com/smsmessaging/v1/outbound/{self.sender_number}/requests"
        else:
            self.sms_url = None

    def get_access_token(self):
        """Récupère le token OAuth2 d'Orange"""
        if not self.client_id or not self.client_secret:
            logger.error("ORANGE_SMS_CLIENT_ID or ORANGE_SMS_CLIENT_SECRET not configured")
            return None

        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_header = base64.b64encode(auth_string.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {auth_header}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}
        
        try:
            response = requests.post(self.token_url, headers=headers, data=data, timeout=10)
            response.raise_for_status()
            return response.json().get("access_token")
        except Exception as e:
            logger.error(f"Error fetching Orange Access Token: {e}")
            return None

    def send_sms(self, phone_number, message):
        """Envoie un SMS via l'API Orange"""
        if not self.sms_url:
            logger.error("ORANGE_SMS_SENDER_NUMBER not configured")
            return False

        # Formater le numéro du destinataire (doit commencer par tel:+224)
        clean_phone = phone_number.replace(" ", "").replace("-", "")
        if not clean_phone.startswith('tel:'):
            if clean_phone.startswith('+'):
                receiver_address = f"tel:{clean_phone}"
            elif clean_phone.startswith('224'):
                receiver_address = f"tel:+{clean_phone}"
            else:
                receiver_address = f"tel:+224{clean_phone}"
        else:
            receiver_address = clean_phone
        
        token = self.get_access_token()
        if not token:
            return False
            
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "outboundSMSMessageRequest": {
                "address": receiver_address,
                "senderAddress": self.sender_number,
                "outboundSMSTextMessage": {
                    "message": message
                }
            }
        }
        
        try:
            response = requests.post(self.sms_url, headers=headers, json=payload, timeout=15)
            # En développement, on affiche aussi dans la console pour débugger
            if settings.DEBUG:
                print(f"[SMS] Vers {receiver_address}: {message}")
                print(f"[ORANGE API RESPONSE] {response.status_code}: {response.text}")
            
            response.raise_for_status()
            return True
        except Exception as e:
            logger.error(f"Error sending Orange SMS: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response content: {e.response.text}")
            return False
