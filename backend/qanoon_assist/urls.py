from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from users.views import (
    LawyerViewSet, LawyerSpecialtyViewSet,
    CitizenRegistrationView, LawyerRegistrationView,
    CustomTokenObtainPairView, get_current_user
)
from users.admin_views import AdminDashboardViewSet

router = DefaultRouter()
router.register(r'lawyers', LawyerViewSet)
router.register(r'specialties', LawyerSpecialtyViewSet)
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include(router.urls)),

    path('api/auth/', include('users.urls')),
    path('api/', include('users.urls')),  # For lawyers, specialties endpoints
    path('api/', include('cases.urls')),  # ADD THIS LINE
    path('api/', include('messaging.urls')),
    path('api/knowledge-base/', include('knowledge_base.urls')),  # For KB categories, articles
    
    # Authentication
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/citizen/', CitizenRegistrationView.as_view(), name='citizen_register'),
    path('api/auth/register/lawyer/', LawyerRegistrationView.as_view(), name='lawyer_register'),
    path('api/auth/me/', get_current_user, name='current_user'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)