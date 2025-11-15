from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'specialty', 'author', 'is_published', 'views_count', 'created_at']
    list_filter = ['is_published', 'specialty', 'created_at']
    search_fields = ['title', 'content']