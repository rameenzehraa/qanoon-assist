from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaseRequestViewSet, CaseViewSet, HearingViewSet, CaseUpdateViewSet

router = DefaultRouter()
router.register(r'case-requests', CaseRequestViewSet, basename='case-request')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'hearings', HearingViewSet, basename='hearing')
router.register(r'case-updates', CaseUpdateViewSet, basename='case-update')

urlpatterns = [
    path('', include(router.urls)),
]