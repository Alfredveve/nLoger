from rest_framework import serializers
from .models import OccupationRequest, VisitVoucher, VisitVoucher

class OccupationRequestSerializer(serializers.ModelSerializer):
    property_title = serializers.ReadOnlyField(source='property.title')
    user_username = serializers.ReadOnlyField(source='user.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = OccupationRequest
        fields = [
            'id', 'property', 'property_title', 'user', 'user_username', 
            'status', 'status_display', 'created_at',
            'requires_payment', 'payment_amount', 'payment_status', 'payment_deadline'
        ]
        read_only_fields = ['user', 'status']

class VisitVoucherSerializer(serializers.ModelSerializer):
    property_title = serializers.ReadOnlyField(source='property.title')
    visitor_username = serializers.ReadOnlyField(source='visitor.username')
    agent_username = serializers.ReadOnlyField(source='agent.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    location_link = serializers.SerializerMethodField()

    class Meta:
        model = VisitVoucher
        fields = [
            'id', 'agent', 'agent_username', 'visitor', 'visitor_username', 'property', 'property_title',
            'scheduled_at', 'validation_code', 'status', 'status_display', 'location_link',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['agent', 'visitor', 'validation_code', 'status', 'rating', 'comment']

    def get_location_link(self, obj):
        if obj.status == 'ACCEPTED' and obj.property.latitude and obj.property.longitude:
            return f"https://www.google.com/maps/search/?api=1&query={obj.property.latitude},{obj.property.longitude}"
        return None
