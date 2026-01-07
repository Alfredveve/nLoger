from django.contrib import admin
from .models import Property, PropertyImage, ManagementMandate

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'property_type', 'price', 'secteur', 'is_available', 'owner', 'created_at')
    list_filter = ('property_type', 'is_available', 'secteur', 'created_at')
    search_fields = ('title', 'description', 'address_details')
    inlines = [PropertyImageInline]
    raw_id_fields = ('owner', 'agent', 'secteur')
    date_hierarchy = 'created_at'

@admin.register(ManagementMandate)
class ManagementMandateAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'agent', 'property_type', 'status', 'created_at')
    list_filter = ('status', 'property_type', 'created_at')
    search_fields = ('owner__username', 'agent__username', 'location_description')
    raw_id_fields = ('owner', 'agent')
    date_hierarchy = 'created_at'
    list_editable = ('status',)
