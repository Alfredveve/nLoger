from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'kyc_status', 'is_demarcheur', 'is_proprietaire', 'is_locataire', 'is_staff', 'is_active')
    list_filter = ('kyc_status', 'is_demarcheur', 'is_proprietaire', 'is_locataire', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone')
    list_editable = ('kyc_status', 'is_active')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informations de Rôle', {'fields': ('phone', 'is_demarcheur', 'is_proprietaire', 'is_locataire')}),
        ('Vérification (KYC)', {'fields': ('kyc_status', 'bio_document', 'contract_document', 'engagement_signed')}),
        ('Avatar', {'fields': ('avatar',)}),
    )

admin.site.register(User, CustomUserAdmin)
