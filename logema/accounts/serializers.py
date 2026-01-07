from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 
                  'is_demarcheur', 'is_proprietaire', 'is_locataire', 'kyc_status',
                  'is_staff', 'is_superuser', 'avatar')
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
