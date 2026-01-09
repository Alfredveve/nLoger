from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PaymentViewSet,
    EscrowViewSet,
    TransactionViewSet,
    PaymentMethodViewSet,
    PaymentDisputeViewSet,
    PaymentWebhookView
)

router = DefaultRouter()
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'escrow', EscrowViewSet, basename='escrow')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'disputes', PaymentDisputeViewSet, basename='dispute')

urlpatterns = [
    path('', include(router.urls)),
    path('payments/webhook/<str:provider>/', PaymentWebhookView.as_view(), name='payment-webhook'),
]
