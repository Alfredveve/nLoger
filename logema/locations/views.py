from rest_framework import viewsets
from .models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from .serializers import (
    RegionSerializer, PrefectureSerializer, SousPrefectureSerializer, 
    VilleSerializer, QuartierSerializer, SecteurSerializer
)

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class PrefectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Prefecture.objects.all()
    serializer_class = PrefectureSerializer
    filterset_fields = ['region']

class SousPrefectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SousPrefecture.objects.all()
    serializer_class = SousPrefectureSerializer
    filterset_fields = ['prefecture']

class VilleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ville.objects.all()
    serializer_class = VilleSerializer
    filterset_fields = ['sous_prefecture']

class QuartierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quartier.objects.all()
    serializer_class = QuartierSerializer
    filterset_fields = ['ville']

class SecteurViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Secteur.objects.all()
    serializer_class = SecteurSerializer
    filterset_fields = ['quartier']
