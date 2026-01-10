
from django.db import models
from django.shortcuts import render
from django.db import models
from django.utils.crypto import get_random_string
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import OccupationRequest, VisitVoucher
from .serializers import OccupationRequestSerializer, VisitVoucherSerializer
from properties.models import Property

class OccupationRequestViewSet(viewsets.ModelViewSet):
    queryset = OccupationRequest.objects.all()
    serializer_class = OccupationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Users see their requests, Agents/Owners see requests on their properties
        user = self.request.user
        if user.is_demarcheur or user.is_proprietaire:
             # Logic could be refined: agent sees requests on properties they manage
             return OccupationRequest.objects.filter(property__agent=user) | OccupationRequest.objects.filter(user=user)
    @action(detail=True, methods=['post'])
    def validate_occupation(self, request, pk=None):
        """Démarcheur valide le dossier de réservation"""
        occupation = self.get_object()
        # Verify if user is the agent of the property
        if request.user != occupation.property.agent and request.user != occupation.property.owner:
            return Response({"error": "Non autorisé"}, status=403)
            
        if occupation.status != 'PENDING':
            return Response({"error": "Statut invalide"}, status=400)
        
        occupation.status = 'VALIDATED'
        occupation.save()
        return Response({"status": "Dossier validé"})

    @action(detail=True, methods=['post'])
    def cancel_occupation(self, request, pk=None):
        """Démarcheur ou Locataire annule le dossier"""
        occupation = self.get_object()
        
        # Check permissions
        is_agent = (request.user == occupation.property.agent or request.user == occupation.property.owner)
        is_tenant = (request.user == occupation.user)
        
        if not is_agent and not is_tenant:
             return Response({"error": "Non autorisé"}, status=403)
        
        occupation.status = 'CANCELLED'
        occupation.save()
        return Response({"status": "Dossier annulé"})

class VisitVoucherViewSet(viewsets.ModelViewSet):
    queryset = VisitVoucher.objects.all()
    serializer_class = VisitVoucherSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return VisitVoucher.objects.filter(models.Q(visitor=user) | models.Q(agent=user))

    def perform_create(self, serializer):
        # Auto-generate 6-digit code
        code = get_random_string(length=6, allowed_chars='0123456789')
        # Agent is derived from property
        property_id = self.request.data.get('property')
        scheduled_at = self.request.data.get('scheduled_at')
        
        if not scheduled_at:
             # This should ideally be caught by serializer validation, 
             # but keeping a safeguard or letting it fail gracefully.
             pass

        try:
             prop = Property.objects.get(id=property_id)
             agent = prop.agent
             if not agent:
                 agent = prop.owner 
             serializer.save(visitor=self.request.user, validation_code=code, agent=agent, status='REQUESTED')
        except Property.DoesNotExist:
             pass

    @action(detail=True, methods=['post'])
    def validate_visit(self, request, pk=None):
        """
        Agent/Owner validates the visit using the code provided by the visitor.
        """
        visit = self.get_object()
        code = request.data.get('code')
        
        # Only the assigned agent (or owner) can validate
        if request.user != visit.agent:
            return Response({"error": "Vous n'êtes pas autorisé à valider cette visite"}, status=403)
            
        if visit.status not in ['REQUESTED', 'ACCEPTED']:
             return Response({"error": "Visite déjà traitée ou non confirmée"}, status=400)
             
        if code == visit.validation_code:
            visit.status = 'VALIDATED'
            visit.save()
            return Response({"status": "Visite validée avec succès"})
        else:
            return Response({"error": "Code invalide"}, status=400)

    @action(detail=True, methods=['post'])
    def accept_visit(self, request, pk=None):
        """Démarcheur accepte la demande de visite"""
        visit = self.get_object()
        if request.user != visit.agent:
            return Response({"error": "Non autorisé"}, status=403)
        if visit.status != 'REQUESTED':
            return Response({"error": "Statut invalide"}, status=400)
        
        visit.status = 'ACCEPTED'
        visit.save()
        return Response({"status": "Visite acceptée"})

    @action(detail=True, methods=['post'])
    def reject_visit(self, request, pk=None):
        """Démarcheur refuse la demande de visite"""
        visit = self.get_object()
        if request.user != visit.agent:
            return Response({"error": "Non autorisé"}, status=403)
        if visit.status != 'REQUESTED':
            return Response({"error": "Statut invalide"}, status=400)
        
        visit.status = 'REJECTED'
        visit.save()
        return Response({"status": "Visite refusée"})

    @action(detail=True, methods=['post'])
    def cancel_visit(self, request, pk=None):
        """Visiteur ou Démarcheur annule la visite"""
        visit = self.get_object()
        if request.user != visit.agent and request.user != visit.visitor:
            return Response({"error": "Non autorisé"}, status=403)
        
        visit.status = 'CANCELLED'
        visit.save()
        return Response({"status": "Visite annulée"})

    @action(detail=True, methods=['post'])
    def rate_visit(self, request, pk=None):
        """
        Visitor rates the visit after it has been validated.
        """
        visit = self.get_object()
        if request.user != visit.visitor:
             return Response({"error": "Seul le visiteur peut noter"}, status=403)
             
        if visit.status != 'VALIDATED':
            return Response({"error": "La visite doit être validée avant d'être notée"}, status=400)
            
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')
        
        if rating:
            visit.rating = rating
            visit.comment = comment
            visit.save()
            
            # Update Agent Reputation (simple average logic)
            agent = visit.agent
            current_score = agent.reputation_score
            # Ideal: Recalculate average from all ratings. existing score is simple float.
            # Weighted average update for simplicity or re-aggregation
            # simplified: 
            # new_score = (old * n + new) / (n+1) -> but we don't store N
            # Let's just do a 10% movement for now or Re-aggregate if heavy
            # Better: Aggregate
            avg = VisitVoucher.objects.filter(agent=agent, rating__isnull=False).aggregate(models.Avg('rating'))
            if avg['rating__avg']:
                agent.reputation_score = round(avg['rating__avg'], 1)
                agent.save()
                
            return Response({"status": "Note enregistrée"})
        return Response({"error": "Note requise"}, status=400)
