from django.db.models import Count, Q
from rest_framework import viewsets
from .models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur
from .serializers import (
    RegionSerializer, PrefectureSerializer, SousPrefectureSerializer, 
    VilleSerializer, QuartierSerializer, SecteurSerializer
)

class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Region.objects.annotate(
        property_count=Count(
            'prefectures__sous_prefectures__villes__quartiers__secteurs__properties',
            filter=Q(prefectures__sous_prefectures__villes__quartiers__secteurs__properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = RegionSerializer

class PrefectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Prefecture.objects.annotate(
        property_count=Count(
            'sous_prefectures__villes__quartiers__secteurs__properties',
            filter=Q(sous_prefectures__villes__quartiers__secteurs__properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = PrefectureSerializer
    filterset_fields = ['region']

class SousPrefectureViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SousPrefecture.objects.annotate(
        property_count=Count(
            'villes__quartiers__secteurs__properties',
            filter=Q(villes__quartiers__secteurs__properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = SousPrefectureSerializer
    filterset_fields = ['prefecture']

class VilleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ville.objects.annotate(
        property_count=Count(
            'quartiers__secteurs__properties',
            filter=Q(quartiers__secteurs__properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = VilleSerializer
    filterset_fields = ['sous_prefecture']

class QuartierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Quartier.objects.annotate(
        property_count=Count(
            'secteurs__properties',
            filter=Q(secteurs__properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = QuartierSerializer
    filterset_fields = ['ville']

class SecteurViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Secteur.objects.annotate(
        property_count=Count(
            'properties',
            filter=Q(properties__is_available=True),
            distinct=True
        )
    )
    serializer_class = SecteurSerializer
    filterset_fields = ['quartier']
