from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    CitizenRegistrationView,
    LawyerRegistrationView,
    get_current_user,
    LawyerViewSet,
    LawyerSpecialtyViewSet,
)
from .admin_views import AdminDashboardViewSet  # ⬅️ ADD THIS IMPORT

router = DefaultRouter()
router.register(r'lawyers', LawyerViewSet, basename='lawyer')
router.register(r'specialties', LawyerSpecialtyViewSet, basename='specialty')
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')  # ⬅️ ADD THIS LINE

urlpatterns = [
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/citizen/', CitizenRegistrationView.as_view(), name='citizen_register'),
    path('auth/register/lawyer/', LawyerRegistrationView.as_view(), name='lawyer_register'),
    path('auth/me/', get_current_user, name='current_user'),
    
    # Routers
    path('', include(router.urls)),
]