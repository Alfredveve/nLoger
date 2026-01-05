from django.contrib import admin
from .models import Property, PropertyImage

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'price', 'secteur', 'is_available', 'owner')
    list_filter = ('property_type', 'is_available', 'secteur')
    search_fields = ('title', 'description')
    inlines = [PropertyImageInline]
    raw_id_fields = ('owner', 'agent', 'secteur')
