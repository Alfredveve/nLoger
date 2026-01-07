from rest_framework import serializers
from .models import OccupationRequest

class OccupationRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    property_title = serializers.ReadOnlyField(source='property.title')

    class Meta:
        model = OccupationRequest
        fields = [
            'id', 'property', 'property_title', 'user', 'user_username',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status']
