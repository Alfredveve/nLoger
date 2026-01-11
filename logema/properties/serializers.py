from rest_framework import serializers
from .models import Property, PropertyImage, ManagementMandate, MandateHistory
from locations.models import Secteur

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    secteur = serializers.PrimaryKeyRelatedField(queryset=Secteur.objects.all(), required=False, allow_null=True)
    secteur_name = serializers.ReadOnlyField(source='secteur.name')
    quartier_name = serializers.ReadOnlyField(source='secteur.quartier.name')
    
    # Contact details
    agent_name = serializers.ReadOnlyField(source='agent.username')
    agent_phone = serializers.ReadOnlyField(source='agent.phone')
    owner_name = serializers.ReadOnlyField(source='owner.username')
    owner_phone = serializers.ReadOnlyField(source='owner.phone')
    is_under_validation = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'owner_name', 'owner_phone', 'agent', 'agent_name', 'agent_phone',
            'title', 'description', 
            'property_type', 'price', 'secteur', 'secteur_name', 
            'quartier_name', 'latitude', 'longitude', 'address_details', 
            'religion_preference', 'ethnic_preference', 'is_available', 
            'is_under_validation', 'images', 'created_at'
        ]
        read_only_fields = ['owner']

class ManagementMandateSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    agent_username = serializers.ReadOnlyField(source='agent.username', allow_null=True)
    mandate_type_display = serializers.CharField(source='get_mandate_type_display', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ManagementMandate
        fields = [
            'id', 'owner', 'owner_username', 'agent', 'agent_username',
            'property_type', 'property_type_display', 'location_description',
            'property_description', 'expected_price', 'status', 'status_display',
            'owner_phone', 'created_at', 'updated_at',
            'mandate_type', 'mandate_type_display', 'commission_percentage',
            'signature_owner', 'signature_agent', 'signed_at'
        ]
        read_only_fields = ['owner', 'status', 'agent', 'signature_owner', 'signature_agent', 'signed_at']

class MandateHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MandateHistory
        fields = ['id', 'status', 'comment', 'created_at']
