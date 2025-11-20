from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import F

from .models import Article
from .serializers import ArticleSerializer, ArticleListSerializer

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ArticleListSerializer
        return ArticleSerializer
    
    def get_permissions(self):
        # Public can view published articles, admin can do everything
        if self.action in ['list', 'retrieve', 'public_list']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # If not admin, only show published articles
        if not (self.request.user.is_authenticated and self.request.user.user_type == 'admin'):
            queryset = queryset.filter(is_published=True)
        
        # Filter by specialty
        specialty_id = self.request.query_params.get('specialty', None)
        if specialty_id:
            queryset = queryset.filter(specialty_id=specialty_id)
        
        # Search by title
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only admins can create articles
        if self.request.user.user_type != 'admin':
            raise PermissionError("Only admins can create articles")
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only admins can update articles
        if self.request.user.user_type != 'admin':
            raise PermissionError("Only admins can update articles")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admins can delete articles
        if self.request.user.user_type != 'admin':
            raise PermissionError("Only admins can delete articles")
        instance.delete()
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        
        # Increment view count
        Article.objects.filter(pk=instance.pk).update(views_count=F('views_count') + 1)
        instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_list(self, request):
        """Public endpoint for browsing published articles"""
        articles = self.get_queryset().filter(is_published=True)
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)