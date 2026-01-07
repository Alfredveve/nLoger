from django.contrib import admin
from .models import OccupationRequest

@admin.register(OccupationRequest)
class OccupationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('property__title', 'user__username')
    raw_id_fields = ('property', 'user')
    list_editable = ('status',)
