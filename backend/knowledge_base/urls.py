from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.LegalCategoryViewSet, basename='category')
router.register(r'articles', views.LegalArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]