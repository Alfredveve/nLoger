from rest_framework import serializers
from .models import Property, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    secteur_name = serializers.ReadOnlyField(source='secteur.name')
    quartier_name = serializers.ReadOnlyField(source='secteur.quartier.name')
    
    # Contact details
    agent_name = serializers.ReadOnlyField(source='agent.username')
    agent_phone = serializers.ReadOnlyField(source='agent.phone')
    owner_name = serializers.ReadOnlyField(source='owner.username')
    owner_phone = serializers.ReadOnlyField(source='owner.phone')
    
    class Meta:
        model = Property
        fields = [
            'id', 'owner', 'owner_name', 'owner_phone', 'agent', 'agent_name', 'agent_phone',
            'title', 'description', 
            'property_type', 'price', 'secteur', 'secteur_name', 
            'quartier_name', 'latitude', 'longitude', 'address_details', 
            'religion_preference', 'ethnic_preference', 'is_available', 
            'images', 'created_at'
        ]
        read_only_fields = ['owner']
