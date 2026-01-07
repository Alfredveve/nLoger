from django.db import models
from rest_framework import viewsets, permissions
from .models import Property, ManagementMandate
from locations.models import Ville, Quartier, Secteur
from .serializers import PropertySerializer, ManagementMandateSerializer
from .filters import PropertyFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from math import sin, cos, sqrt, atan2, radians

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.select_related(
        'secteur__quartier__ville__sous_prefecture__prefecture__region',
        'owner',
        'agent'
    ).prefetch_related('images').all()
    serializer_class = PropertySerializer
    filterset_class = PropertyFilter
    
    def perform_create(self, serializer):
        # Handle semi-automated location creation
        secteur_id = self.request.data.get('secteur')
        secteur_name = self.request.data.get('secteur_custom_name')
        quartier_name = self.request.data.get('quartier_custom_name')
        ville_id = self.request.data.get('ville')

        if (not secteur_id or secteur_id == 'custom') and secteur_name and ville_id:
            # If secteur_id is missing or 'custom', create them
            try:
                ville = Ville.objects.get(id=ville_id)
            except Ville.DoesNotExist:
                serializer.save(owner=self.request.user)
                return
            
            q_id = self.request.data.get('quartier')
            if q_id and q_id != 'custom':
                try:
                    quartier = Quartier.objects.get(id=q_id)
                except Quartier.DoesNotExist:
                    if quartier_name:
                        quartier, _ = Quartier.objects.get_or_create(name=quartier_name, ville=ville)
                    else:
                        serializer.save(owner=self.request.user)
                        return
            elif quartier_name:
                quartier, _ = Quartier.objects.get_or_create(name=quartier_name, ville=ville)
            else:
                serializer.save(owner=self.request.user)
                return

            secteur, _ = Secteur.objects.get_or_create(name=secteur_name, quartier=quartier)
            serializer.save(owner=self.request.user, secteur=secteur)
        else:
            serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        dist = self.request.query_params.get('dist', 10) # Default 10km

        if lat and lng:
            try:
                lat = float(lat)
                lng = float(lng)
                dist = float(dist)
                
                # Simple approximation for SQLite (bounding box)
                # 1 degree lat ~ 111km
                # 1 degree lng ~ 111km * cos(lat)
                lat_range = dist / 111.0
                lng_range = dist / (111.0 * abs(cos(radians(lat))))
                
                queryset = queryset.filter(
                    latitude__range=(lat - lat_range, lat + lat_range),
                    longitude__range=(lng - lng_range, lng + lng_range),
                    is_available=True
                )
            except (ValueError, TypeError):
                pass
        return queryset

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """
        Special endpoint to return nearby properties with distance calculation.
        """
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        if not lat or not lng:
            return Response({"error": "Latitude and longitude are required"}, status=400)
            
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        # Add distance to each property
        user_lat = float(lat)
        user_lng = float(lng)
        R = 6371.0 # Earth radius
        
        dist_limit = float(request.query_params.get('dist', 10))
        final_data = []
        
        for prop in data:
            if prop['latitude'] and prop['longitude']:
                p_lat = float(prop['latitude'])
                p_lng = float(prop['longitude'])
                
                dlon = radians(p_lng - user_lng)
                dlat = radians(p_lat - user_lat)
                
                a = sin(dlat / 2)**2 + cos(radians(user_lat)) * cos(radians(p_lat)) * sin(dlon / 2)**2
                c = 2 * atan2(sqrt(a), sqrt(1 - a))
                distance = R * c
                
                if distance <= dist_limit:
                    prop['distance'] = round(distance, 2)
                    final_data.append(prop)
        
        # Sort by distance
        final_data.sort(key=lambda x: x.get('distance', 999999))
        
        return Response(final_data)

class ManagementMandateViewSet(viewsets.ModelViewSet):
    queryset = ManagementMandate.objects.all()
    serializer_class = ManagementMandateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_demarcheur:
            # Agents see pending mandates or ones assigned to them
            return ManagementMandate.objects.filter(
                models.Q(status='PENDING') | models.Q(agent=user)
            )
        # Owners only see their own mandates
        return ManagementMandate.objects.filter(owner=user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        mandate = self.get_object()
        if not request.user.is_demarcheur:
            return Response({"error": "Only agents can accept mandates"}, status=403)
        
        if mandate.status != 'PENDING':
            return Response({"error": "Mandate is not pending"}, status=400)
        
        mandate.agent = request.user
        mandate.status = 'ACCEPTED'
        mandate.save()
        return Response(self.get_serializer(mandate).data)


