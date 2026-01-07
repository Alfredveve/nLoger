from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'roles', 'is_demarcheur', 'is_active', 'kyc_status')
    list_filter = ('roles', 'is_demarcheur', 'is_active', 'kyc_status')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {'fields': ('roles', 'phone', 'is_demarcheur', 'is_proprietaire', 'is_locataire')}),
        ('Vérification (KYC)', {'fields': ('kyc_status', 'bio_document', 'contract_document', 'engagement_signed')}),
    )

admin.site.register(User, CustomUserAdmin)
