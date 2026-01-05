from django.urls import path, include
from rest_framework.routers import DefaultRouter
from locations.views import (
    RegionViewSet, PrefectureViewSet, SousPrefectureViewSet,
    VilleViewSet, QuartierViewSet, SecteurViewSet
)
from properties.views import PropertyViewSet

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'prefectures', PrefectureViewSet)
router.register(r'sous-prefectures', SousPrefectureViewSet)
router.register(r'villes', VilleViewSet)
router.register(r'quartiers', QuartierViewSet)
router.register(r'secteurs', SecteurViewSet)
router.register(r'properties', PropertyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
