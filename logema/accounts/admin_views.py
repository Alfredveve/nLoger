from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from django.db.models import Count
from .models import User
from properties.models import Property, ManagementMandate
from transactions.models import OccupationRequest
from .admin_serializers import (
    AdminUserSerializer, AdminPropertySerializer, 
    AdminMandateSerializer, AdminStatsSerializer,
    AdminOccupationRequestSerializer
)
from .permissions import IsAdminUser

class AdminStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            'total_users': User.objects.count(),
            'total_properties': Property.objects.count(),
            'total_mandates': ManagementMandate.objects.count(),
            'total_occupations': OccupationRequest.objects.count(),
            'pending_kyc': User.objects.filter(kyc_status='PENDING').count(),
            'pending_mandates': ManagementMandate.objects.filter(status='PENDING').count(),
            'available_properties': Property.objects.filter(is_available=True).count(),
        }
        serializer = AdminStatsSerializer(data)
        return Response(serializer.data)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_demarcheur', 'is_proprietaire', 'is_locataire', 'kyc_status', 'is_active']
    search_fields = ['username', 'email', 'phone']

class AdminPropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('-created_at')
    serializer_class = AdminPropertySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['property_type', 'is_available', 'secteur']
    search_fields = ['title', 'description']

class AdminMandateViewSet(viewsets.ModelViewSet):
    queryset = ManagementMandate.objects.all().order_by('-created_at')
    serializer_class = AdminMandateSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status', 'property_type']
    search_fields = ['owner__username', 'agent__username']

class AdminOccupationViewSet(viewsets.ModelViewSet):
    queryset = OccupationRequest.objects.all().order_by('-created_at')
    serializer_class = AdminOccupationRequestSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status']
    search_fields = ['property__title', 'user__username']

class AdminAnalyticsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Pour simplifier, on renvoie quelques agrégations
        # En production, on utiliserait des requêtes plus complexes par date
        users_by_role = {
            'demarcheurs': User.objects.filter(is_demarcheur=True).count(),
            'proprietaires': User.objects.filter(is_proprietaire=True).count(),
            'locataires': User.objects.filter(is_locataire=True).count(),
        }
        
        properties_by_type = Property.objects.values('property_type').annotate(count=Count('id'))
        
        mandates_by_status = ManagementMandate.objects.values('status').annotate(count=Count('id'))
        
        return Response({
            'users_by_role': users_by_role,
            'properties_by_type': properties_by_type,
            'mandates_by_status': mandates_by_status,
        })
