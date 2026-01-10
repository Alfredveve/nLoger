from django.contrib import admin
from .models import (
    Payment,
    EscrowAccount,
    PaymentDistribution,
    Transaction,
    PaymentMethod,
    PaymentDispute
)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'payer_link',
        'amount_display',
        'status_tag',
        'payment_method',
        'created_at'
    ]
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['id', 'payer__username', 'transaction_id', 'payment_phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'completed_at']
    
    def payer_link(self, obj):
        from django.utils.html import format_html
        from django.urls import reverse
        url = reverse('admin:accounts_user_change', args=[obj.payer.id])
        return format_html('<a href="{}">{}</a>', url, obj.payer.username)
    payer_link.short_description = "Payeur"

    def amount_display(self, obj):
        return f"{obj.amount} {obj.currency}"
    amount_display.short_description = "Montant"

    def status_tag(self, obj):
        from django.utils.html import format_html
        colors = {
            'PENDING': '#ffc107',       # Warning (Yellow)
            'PROCESSING': '#17a2b8',    # Info (Blue)
            'HELD_IN_ESCROW': '#6610f2', # Indigo
            'RELEASED': '#28a745',       # Success (Green)
            'REFUNDED': '#dc3545',       # Danger (Red)
            'FAILED': '#6c757d',         # Gray
            'CANCELLED': '#343a40',      # Dark
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 0.8em;">{}</span>',
            color, obj.get_status_display()
        )
    status_tag.short_description = "Statut"
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('id', 'occupation_request', 'payer', 'amount', 'currency')
        }),
        ('Statut et méthode', {
            'fields': ('status', 'payment_method', 'payment_phone')
        }),
        ('Informations du fournisseur', {
            'fields': ('transaction_id', 'provider_reference', 'provider_response')
        }),
        ('Métadonnées', {
            'fields': ('description', 'created_at', 'updated_at', 'completed_at')
        }),
    )


@admin.register(EscrowAccount)
class EscrowAccountAdmin(admin.ModelAdmin):
    list_display = [
        'payment',
        'held_amount',
        'status_tag',
        'held_at',
        'release_scheduled_date',
        'released_at'
    ]
    list_filter = ['status', 'held_at']
    search_fields = ['payment__id']
    readonly_fields = ['held_at', 'released_at']

    def status_tag(self, obj):
        from django.utils.html import format_html
        colors = {
            'HOLDING': '#6610f2',    # Indigo
            'RELEASED': '#28a745',   # Green
            'REFUNDED': '#dc3545',   # Red
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 0.8em;">{}</span>',
            color, obj.get_status_display()
        )
    status_tag.short_description = "Statut"
    
    actions = ['release_funds', 'process_refund']
    
    def release_funds(self, request, queryset):
        """Action pour libérer les fonds manuellement"""
        from django.utils import timezone
        count = 0
        for escrow in queryset.filter(status='HOLDING'):
            escrow.status = 'RELEASED'
            escrow.released_at = timezone.now()
            escrow.save()
            count += 1
        self.message_user(request, f"{count} compte(s) escrow libéré(s)")
    release_funds.short_description = "Libérer les fonds sélectionnés"
    
    def process_refund(self, request, queryset):
        """Action pour rembourser"""
        from django.utils import timezone
        count = 0
        for escrow in queryset.filter(status='HOLDING'):
            escrow.status = 'REFUNDED'
            escrow.released_at = timezone.now()
            escrow.save()
            count += 1
        self.message_user(request, f"{count} remboursement(s) traité(s)")
    process_refund.short_description = "Rembourser les paiements sélectionnés"


@admin.register(PaymentDistribution)
class PaymentDistributionAdmin(admin.ModelAdmin):
    list_display = [
        'payment',
        'recipient',
        'amount',
        'distribution_type',
        'status',
        'created_at',
        'completed_at'
    ]
    list_filter = ['distribution_type', 'status', 'created_at']
    search_fields = ['payment__id', 'recipient__username']
    readonly_fields = ['created_at', 'completed_at']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'payment',
        'transaction_type',
        'amount',
        'status',
        'created_at'
    ]
    list_filter = ['transaction_type', 'status', 'created_at']
    search_fields = ['id', 'payment__id']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'method_type',
        'phone_number',
        'is_default',
        'is_verified',
        'last_used_at'
    ]
    list_filter = ['method_type', 'is_default', 'is_verified']
    search_fields = ['user__username', 'phone_number']
    readonly_fields = ['created_at', 'updated_at', 'last_used_at']


@admin.register(PaymentDispute)
class PaymentDisputeAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'payment',
        'raised_by',
        'status_tag',
        'resolution',
        'created_at',
    ]
    list_filter = ['status', 'resolution', 'created_at']
    search_fields = ['payment__id', 'raised_by__username']
    readonly_fields = ['created_at', 'updated_at', 'resolved_at']

    def status_tag(self, obj):
        from django.utils.html import format_html
        colors = {
            'OPEN': '#dc3545',          # Danger (Red)
            'INVESTIGATING': '#17a2b8', # Info (Blue)
            'RESOLVED': '#28a745',      # Success (Green)
            'CLOSED': '#6c757d',        # Gray
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 0.8em;">{}</span>',
            color, obj.get_status_display()
        )
    status_tag.short_description = "Statut"
    
    fieldsets = (
        ('Informations du litige', {
            'fields': ('payment', 'raised_by', 'reason', 'status')
        }),
        ('Résolution', {
            'fields': ('resolution', 'resolution_notes', 'resolved_by', 'resolved_at')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at')
        }),
    )
