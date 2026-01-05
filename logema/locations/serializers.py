from rest_framework import serializers
from .models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur

class SecteurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Secteur
        fields = '__all__'

class QuartierSerializer(serializers.ModelSerializer):
    secteurs = SecteurSerializer(many=True, read_only=True)
    class Meta:
        model = Quartier
        fields = '__all__'

class VilleSerializer(serializers.ModelSerializer):
    quartiers = QuartierSerializer(many=True, read_only=True)
    class Meta:
        model = Ville
        fields = '__all__'

class SousPrefectureSerializer(serializers.ModelSerializer):
    villes = VilleSerializer(many=True, read_only=True)
    class Meta:
        model = SousPrefecture
        fields = '__all__'

class PrefectureSerializer(serializers.ModelSerializer):
    sous_prefectures = SousPrefectureSerializer(many=True, read_only=True)
    class Meta:
        model = Prefecture
        fields = '__all__'

class RegionSerializer(serializers.ModelSerializer):
    prefectures = PrefectureSerializer(many=True, read_only=True)
    class Meta:
        model = Region
        fields = '__all__'
