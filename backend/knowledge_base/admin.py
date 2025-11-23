from django.contrib import admin
from .models import LegalCategory, LegalArticle


@admin.register(LegalCategory)
class LegalCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_article_count']
    search_fields = ['name']

    def get_article_count(self, obj):
        return obj.articles.count()
    get_article_count.short_description = 'Number of Articles'


@admin.register(LegalArticle)
class LegalArticleAdmin(admin.ModelAdmin):
    list_display = ['article_number', 'title', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'article_number', 'keywords', 'content']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'article_number', 'category')
        }),
        ('Content', {
            'fields': ('content',)
        }),
        ('Search', {
            'fields': ('keywords',),
            'description': 'Enter comma-separated keywords for better search results'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )