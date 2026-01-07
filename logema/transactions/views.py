from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import OccupationRequest
from .serializers import OccupationRequestSerializer

class OccupationRequestViewSet(viewsets.ModelViewSet):
    queryset = OccupationRequest.objects.all()
    serializer_class = OccupationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_demarcheur:
            # Agents see requests for their properties
            return OccupationRequest.objects.filter(property__agent=user)
        # Regular users see their own requests
        return OccupationRequest.objects.filter(user=user)
