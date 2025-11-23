from rest_framework import serializers
from .models import LegalCategory, LegalArticle


class LegalCategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = LegalCategory
        fields = ['id', 'name', 'description', 'article_count']

    def get_article_count(self, obj):
        return obj.articles.count()


class LegalArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = LegalArticle
        fields = [
            'id',
            'title',
            'article_number',
            'category',
            'category_name',
            'content',
            'keywords',
            'created_at'
        ]