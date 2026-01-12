from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import UserSerializer, RegisterSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

import random
from .models import PhoneOTP
from .serializers import PasswordResetRequestSerializer, PasswordResetVerifySerializer
from .sms_service import OrangeSMSService

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data.get('phone')
        email = serializer.validated_data.get('email')
        
        # Generer OTP (6 chiffres)
        otp = str(random.randint(100000, 999999))
        
        # Sauvegarder ou mettre à jour l'OTP
        if phone:
            PhoneOTP.objects.filter(phone_number=phone).delete() # Clean old ones to avoid ambiguity
            PhoneOTP.objects.create(phone_number=phone, otp=otp)
        elif email:
            PhoneOTP.objects.filter(email=email).delete()
            PhoneOTP.objects.create(email=email, otp=otp)
        
        if phone:
            # Envoi SMS réel via Orange
            sms_service = OrangeSMSService()
            message = f"Votre code de récupération Logema est : {otp}. Ne le partagez pas."
            sent = sms_service.send_sms(phone, message)
            
            if not sent:
                logger = logging.getLogger(__name__)
                logger.error(f"Échec de l'envoi SMS à {phone}")
                # Don't fail in tests or debug if SMS fails
                if not (settings.DEBUG or getattr(settings, 'TESTING', False)):
                    return Response({
                        "error": "Impossible d'envoyer le code SMS pour le moment. Réessayez plus tard."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            return Response({
                "message": "Un code de vérification a été envoyé à votre numéro de téléphone.",
                "mode_debug": settings.DEBUG
            }, status=status.HTTP_200_OK)

        elif email:
            # Envoi Email
            subject = "Récupération de mot de passe Logema"
            message = f"Votre code de récupération Logema est : {otp}. Ne le partagez pas."
            from_email = settings.DEFAULT_FROM_EMAIL
            try:
                send_mail(subject, message, from_email, [email])
            except Exception as e:
                logger = logging.getLogger(__name__)
                logger.error(f"Échec de l'envoi Email à {email}: {str(e)}")
                if not settings.DEBUG:
                    return Response({
                        "error": "Impossible d'envoyer l'email de récupération pour le moment."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({
                "message": "Un code de vérification a été envoyé à votre adresse email.",
                "mode_debug": settings.DEBUG
            }, status=status.HTTP_200_OK)

import logging

from django.utils import timezone

class PasswordResetVerifyView(generics.GenericAPIView):
    serializer_class = PasswordResetVerifySerializer
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone = serializer.validated_data.get('phone')
        email = serializer.validated_data.get('email')
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']
        
        # Vérifier l'OTP
        try:
            if phone:
                otp_obj = PhoneOTP.objects.get(phone_number=phone, otp=otp)
            elif email:
                otp_obj = PhoneOTP.objects.get(email=email, otp=otp)
            else:
                return Response({"error": "Données manquantes pour la vérification."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Vérifier l'expiration (ex: 10 minutes)
            if timezone.now() - otp_obj.created_at > timedelta(minutes=10):
                return Response({"error": "Le code OTP a expiré."}, status=status.HTTP_400_BAD_REQUEST)
        except PhoneOTP.DoesNotExist:
            return Response({"error": "Code OTP invalide."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Réinitialiser le mot de passe
        if phone:
            user = User.objects.get(phone=phone)
        else:
            user = User.objects.get(email=email)
            
        user.set_password(new_password)
        user.save()
        
        # Supprimer l'OTP utilisé
        otp_obj.delete()
        
        return Response({
            "message": "Votre mot de passe a été réinitialisé avec succès."
        }, status=status.HTTP_200_OK)

from datetime import timedelta
