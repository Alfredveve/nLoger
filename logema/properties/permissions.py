from rest_framework import permissions

class IsVerifiedOwnerOrAgent(permissions.BasePermission):
    """
    Allows access only to Property Owners or Agents with a VERIFIED KYC status.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Superusers can always do everything
        if request.user.is_superuser:
            return True
            
        # Check roles: must be owner or agent
        is_authorized_role = getattr(request.user, 'is_proprietaire', False) or getattr(request.user, 'is_demarcheur', False)
        
        # Check KYC status: must be VERIFIED
        is_verified = getattr(request.user, 'kyc_status', '') == 'VERIFIED'
        
        return is_authorized_role and is_verified
