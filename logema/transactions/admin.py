from django.contrib import admin
from .models import OccupationRequest

@admin.register(OccupationRequest)
class OccupationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'user', 'status_tag', 'payment_status_tag', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('property__title', 'user__username')
    raw_id_fields = ('property', 'user')
    
    def status_tag(self, obj):
        from django.utils.html import format_html
        colors = {
            'PENDING': '#ffc107',   # Yellow
            'VALIDATED': '#28a745', # Green
            'CANCELLED': '#dc3545', # Red
            'EXPIRED': '#6c757d',   # Gray
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 0.8em;">{}</span>',
            color, obj.get_status_display()
        )
    status_tag.short_description = "Statut Demande"

    def payment_status_tag(self, obj):
        from django.utils.html import format_html
        colors = {
            'UNPAID': '#dc3545',    # Red
            'PAID': '#28a745',      # Green
            'REFUNDED': '#17a2b8',  # Blue
        }
        color = colors.get(obj.payment_status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 0.8em;">{}</span>',
            color, obj.get_payment_status_display()
        )
    payment_status_tag.short_description = "Statut Paiement"
