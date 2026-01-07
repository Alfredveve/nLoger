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
from transactions.views import OccupationRequestViewSet
from accounts.views import RegisterView, UserProfileView

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

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
