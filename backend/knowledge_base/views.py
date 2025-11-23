from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import LegalCategory, LegalArticle
from .serializers import LegalCategorySerializer, LegalArticleSerializer


class LegalCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List all legal categories"""
    queryset = LegalCategory.objects.all()
    serializer_class = LegalCategorySerializer
    permission_classes = [AllowAny]


class LegalArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Retrieve articles with search and category filtering
    
    Query params:
    - search: keyword search in title, article_number, keywords, content
    - category: filter by category ID
    """
    queryset = LegalArticle.objects.all()
    serializer_class = LegalArticleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = LegalArticle.objects.all()
        
        # Keyword search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(article_number__icontains=search) |
                Q(keywords__icontains=search) |
                Q(content__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset.order_by('article_number')

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search endpoint"""
        search_term = request.query_params.get('q', '')
        category_id = request.query_params.get('category', None)
        
        queryset = LegalArticle.objects.all()
        
        if search_term:
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(article_number__icontains=search_term) |
                Q(keywords__icontains=search_term) |
                Q(content__icontains=search_term)
            )
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })