from django.contrib import admin
from .models import Region, Prefecture, SousPrefecture, Ville, Quartier, Secteur


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Administration des Régions de Guinée"""
    list_display = ('id', 'name', 'get_prefectures_count')
    search_fields = ('name',)
    ordering = ('name',)
    
    def get_prefectures_count(self, obj):
        """Affiche le nombre de préfectures dans la région"""
        return obj.prefectures.count()
    get_prefectures_count.short_description = 'Nombre de Préfectures'


@admin.register(Prefecture)
class PrefectureAdmin(admin.ModelAdmin):
    """Administration des Préfectures"""
    list_display = ('id', 'name', 'region', 'get_sous_prefectures_count')
    list_filter = ('region',)
    search_fields = ('name', 'region__name')
    ordering = ('region__name', 'name')
    raw_id_fields = ('region',)
    
    def get_sous_prefectures_count(self, obj):
        """Affiche le nombre de sous-préfectures"""
        return obj.sous_prefectures.count()
    get_sous_prefectures_count.short_description = 'Nombre de Sous-Préfectures'


@admin.register(SousPrefecture)
class SousPrefectureAdmin(admin.ModelAdmin):
    """Administration des Sous-Préfectures"""
    list_display = ('id', 'name', 'prefecture', 'get_region', 'get_villes_count')
    list_filter = ('prefecture__region', 'prefecture')
    search_fields = ('name', 'prefecture__name', 'prefecture__region__name')
    ordering = ('prefecture__region__name', 'prefecture__name', 'name')
    raw_id_fields = ('prefecture',)
    
    def get_region(self, obj):
        """Affiche la région parente"""
        return obj.prefecture.region.name
    get_region.short_description = 'Région'
    get_region.admin_order_field = 'prefecture__region__name'
    
    def get_villes_count(self, obj):
        """Affiche le nombre de villes"""
        return obj.villes.count()
    get_villes_count.short_description = 'Nombre de Villes'


@admin.register(Ville)
class VilleAdmin(admin.ModelAdmin):
    """Administration des Villes"""
    list_display = ('id', 'name', 'sous_prefecture', 'get_prefecture', 'get_region', 'get_quartiers_count')
    list_filter = ('sous_prefecture__prefecture__region', 'sous_prefecture__prefecture', 'sous_prefecture')
    search_fields = ('name', 'sous_prefecture__name', 'sous_prefecture__prefecture__name')
    ordering = ('sous_prefecture__prefecture__region__name', 'sous_prefecture__prefecture__name', 'name')
    raw_id_fields = ('sous_prefecture',)
    
    def get_prefecture(self, obj):
        """Affiche la préfecture parente"""
        return obj.sous_prefecture.prefecture.name
    get_prefecture.short_description = 'Préfecture'
    get_prefecture.admin_order_field = 'sous_prefecture__prefecture__name'
    
    def get_region(self, obj):
        """Affiche la région parente"""
        return obj.sous_prefecture.prefecture.region.name
    get_region.short_description = 'Région'
    get_region.admin_order_field = 'sous_prefecture__prefecture__region__name'
    
    def get_quartiers_count(self, obj):
        """Affiche le nombre de quartiers"""
        return obj.quartiers.count()
    get_quartiers_count.short_description = 'Nombre de Quartiers'


@admin.register(Quartier)
class QuartierAdmin(admin.ModelAdmin):
    """Administration des Quartiers"""
    list_display = ('id', 'name', 'ville', 'get_sous_prefecture', 'get_prefecture', 'get_region', 'get_secteurs_count')
    list_filter = (
        'ville__sous_prefecture__prefecture__region',
        'ville__sous_prefecture__prefecture',
        'ville__sous_prefecture',
        'ville'
    )
    search_fields = ('name', 'ville__name', 'ville__sous_prefecture__name')
    ordering = ('ville__sous_prefecture__prefecture__region__name', 'ville__name', 'name')
    raw_id_fields = ('ville',)
    
    def get_sous_prefecture(self, obj):
        """Affiche la sous-préfecture parente"""
        return obj.ville.sous_prefecture.name
    get_sous_prefecture.short_description = 'Sous-Préfecture'
    get_sous_prefecture.admin_order_field = 'ville__sous_prefecture__name'
    
    def get_prefecture(self, obj):
        """Affiche la préfecture parente"""
        return obj.ville.sous_prefecture.prefecture.name
    get_prefecture.short_description = 'Préfecture'
    get_prefecture.admin_order_field = 'ville__sous_prefecture__prefecture__name'
    
    def get_region(self, obj):
        """Affiche la région parente"""
        return obj.ville.sous_prefecture.prefecture.region.name
    get_region.short_description = 'Région'
    get_region.admin_order_field = 'ville__sous_prefecture__prefecture__region__name'
    
    def get_secteurs_count(self, obj):
        """Affiche le nombre de secteurs"""
        return obj.secteurs.count()
    get_secteurs_count.short_description = 'Nombre de Secteurs'


@admin.register(Secteur)
class SecteurAdmin(admin.ModelAdmin):
    """Administration des Secteurs"""
    list_display = ('id', 'name', 'quartier', 'get_ville', 'get_sous_prefecture', 'get_prefecture', 'get_region')
    list_filter = (
        'quartier__ville__sous_prefecture__prefecture__region',
        'quartier__ville__sous_prefecture__prefecture',
        'quartier__ville__sous_prefecture',
        'quartier__ville',
        'quartier'
    )
    search_fields = ('name', 'quartier__name', 'quartier__ville__name')
    ordering = ('quartier__ville__sous_prefecture__prefecture__region__name', 'quartier__ville__name', 'name')
    raw_id_fields = ('quartier',)
    
    def get_ville(self, obj):
        """Affiche la ville parente"""
        return obj.quartier.ville.name
    get_ville.short_description = 'Ville'
    get_ville.admin_order_field = 'quartier__ville__name'
    
    def get_sous_prefecture(self, obj):
        """Affiche la sous-préfecture parente"""
        return obj.quartier.ville.sous_prefecture.name
    get_sous_prefecture.short_description = 'Sous-Préfecture'
    get_sous_prefecture.admin_order_field = 'quartier__ville__sous_prefecture__name'
    
    def get_prefecture(self, obj):
        """Affiche la préfecture parente"""
        return obj.quartier.ville.sous_prefecture.prefecture.name
    get_prefecture.short_description = 'Préfecture'
    get_prefecture.admin_order_field = 'quartier__ville__sous_prefecture__prefecture__name'
    
    def get_region(self, obj):
        """Affiche la région parente"""
        return obj.quartier.ville.sous_prefecture.prefecture.region.name
    get_region.short_description = 'Région'
    get_region.admin_order_field = 'quartier__ville__sous_prefecture__prefecture__region__name'
