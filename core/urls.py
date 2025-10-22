from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    UserRegistrationView, current_user,
    LawyerSpecialtyViewSet, CitizenProfileViewSet, LawyerProfileViewSet,
    VerifiedLawyersListView, CaseRequestViewSet, CaseViewSet,
    HearingViewSet, MessageViewSet, ArticleViewSet
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'specialties', LawyerSpecialtyViewSet, basename='specialty')
router.register(r'citizen-profiles', CitizenProfileViewSet, basename='citizen-profile')
router.register(r'lawyer-profiles', LawyerProfileViewSet, basename='lawyer-profile')
router.register(r'case-requests', CaseRequestViewSet, basename='case-request')
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'hearings', HearingViewSet, basename='hearing')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'articles', ArticleViewSet, basename='article')

urlpatterns = [
    # Authentication
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user, name='current_user'),
    
    # Verified Lawyers List
    path('lawyers/verified/', VerifiedLawyersListView.as_view(), name='verified-lawyers'),
    
    # Include router URLs
    path('', include(router.urls)),
]