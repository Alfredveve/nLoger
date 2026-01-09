from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from locations.views import (
    RegionViewSet, PrefectureViewSet, SousPrefectureViewSet,
    VilleViewSet, QuartierViewSet, SecteurViewSet
)
from properties.views import PropertyViewSet, ManagementMandateViewSet
from transactions.views import OccupationRequestViewSet, VisitVoucherViewSet
from accounts.views import RegisterView, UserProfileView

from accounts.admin_views import (
    AdminStatsView, AdminUserViewSet, 
    AdminPropertyViewSet, AdminMandateViewSet, 
    AdminAnalyticsView, AdminOccupationViewSet
)

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'prefectures', PrefectureViewSet)
router.register(r'sous-prefectures', SousPrefectureViewSet)
router.register(r'villes', VilleViewSet)
router.register(r'quartiers', QuartierViewSet)
router.register(r'secteurs', SecteurViewSet)
router.register(r'properties', PropertyViewSet)
router.register(r'mandates', ManagementMandateViewSet)
router.register(r'occupations', OccupationRequestViewSet)
router.register(r'visits', VisitVoucherViewSet)

# Admin routes
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/properties', AdminPropertyViewSet, basename='admin-properties')
router.register(r'admin/mandates', AdminMandateViewSet, basename='admin-mandates')
router.register(r'admin/occupations', AdminOccupationViewSet, basename='admin-occupations')

urlpatterns = [
    path('', include(router.urls)),
    path('', include('payments.urls')),  # Payment endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
]

