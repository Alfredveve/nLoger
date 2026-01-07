from rest_framework import serializers
from .models import User
from properties.models import Property, ManagementMandate
from transactions.models import OccupationRequest

class AdminUserSerializer(serializers.ModelSerializer):
    properties_owned_count = serializers.IntegerField(source='properties_owned.count', read_only=True)
    properties_managed_count = serializers.IntegerField(source='properties_managed.count', read_only=True)
    mandates_given_count = serializers.IntegerField(source='mandates_given.count', read_only=True)
    mandates_received_count = serializers.IntegerField(source='mandates_received.count', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'phone',
            'is_demarcheur', 'is_proprietaire', 'is_locataire', 'kyc_status',
            'is_staff', 'is_active', 'date_joined', 'avatar',
            'properties_owned_count', 'properties_managed_count',
            'mandates_given_count', 'mandates_received_count'
        )

class AdminPropertySerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    agent_username = serializers.CharField(source='agent.username', read_only=True)
    secteur_name = serializers.CharField(source='secteur.nom', read_only=True)

    class Meta:
        model = Property
        fields = '__all__'

class AdminMandateSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    agent_username = serializers.CharField(source='agent.username', read_only=True)

    class Meta:
        model = ManagementMandate
        fields = '__all__'

class AdminOccupationRequestSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = OccupationRequest
        fields = '__all__'

class AdminStatsSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_properties = serializers.IntegerField()
    total_mandates = serializers.IntegerField()
    total_occupations = serializers.IntegerField()
    pending_kyc = serializers.IntegerField()
    pending_mandates = serializers.IntegerField()
    available_properties = serializers.IntegerField()
