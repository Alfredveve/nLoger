from django_filters import rest_framework as filters
from .models import Property

class PropertyFilter(filters.FilterSet):
    # Location filters - cascade from region to secteur
    region = filters.NumberFilter(field_name='secteur__quartier__ville__sous_prefecture__prefecture__region_id')
    prefecture = filters.NumberFilter(field_name='secteur__quartier__ville__sous_prefecture__prefecture_id')
    sous_prefecture = filters.NumberFilter(field_name='secteur__quartier__ville__sous_prefecture_id')
    ville = filters.NumberFilter(field_name='secteur__quartier__ville_id')
    quartier = filters.NumberFilter(field_name='secteur__quartier_id')
    secteur = filters.NumberFilter(field_name='secteur_id')
    
    # Property type filter
    property_type = filters.CharFilter(field_name='property_type')
    
    # Price range filters
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    
    # Availability filter
    is_available = filters.BooleanFilter(field_name='is_available')
    
    # Preference filters (optional)
    religion_preference = filters.CharFilter(field_name='religion_preference', lookup_expr='icontains')
    ethnic_preference = filters.CharFilter(field_name='ethnic_preference', lookup_expr='icontains')

    class Meta:
        model = Property
        fields = [
            'region', 'prefecture', 'sous_prefecture', 'ville', 'quartier', 'secteur',
            'property_type', 'min_price', 'max_price', 'is_available',
            'religion_preference', 'ethnic_preference'
        ]
