from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                  'is_demarcheur', 'is_proprietaire', 'is_locataire', 'kyc_status',
                  'is_staff', 'is_superuser', 'avatar', 'bio_document', 'contract_document')
        read_only_fields = ('kyc_status',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('DEMARCHEUR', 'Démarcheur'), ('PROPRIETAIRE', 'Propriétaire'), ('LOCATAIRE', 'Locataire')], required=True, write_only=True)
    bio_document = serializers.FileField(required=False, write_only=True)
    contract_document = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'phone', 'role', 'bio_document', 'contract_document')

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        bio_document = validated_data.pop('bio_document', None)
        contract_document = validated_data.pop('contract_document', None)
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        
        if role == 'DEMARCHEUR':
            user.is_demarcheur = True
            user.is_active = False  # Deactivate until approved
            user.kyc_status = 'PENDING'
        elif role == 'PROPRIETAIRE':
            user.is_proprietaire = True
        else:
            user.is_locataire = True
            
        if bio_document:
            user.bio_document = bio_document
        if contract_document:
            user.contract_document = contract_document
        
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False)

    def validate(self, data):
        phone = data.get('phone')
        email = data.get('email')

        if not phone and not email:
            raise serializers.ValidationError("Vous devez fournir un numéro de téléphone ou un email.")

        if phone:
            if not User.objects.filter(phone=phone).exists():
                raise serializers.ValidationError({"phone": "Aucun utilisateur trouvé avec ce numéro de téléphone."})
        
        if email:
            if not User.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": "Aucun utilisateur trouvé avec cet email."})
                
        return data

class PasswordResetVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20, required=False)
    email = serializers.EmailField(required=False)
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Les mots de passe ne correspondent pas."})
        return data
