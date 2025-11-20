from rest_framework import serializers
from .models import Article
from users.models import LawyerSpecialty, User

class ArticleSerializer(serializers.ModelSerializer):
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'specialty', 'specialty_name',
            'author', 'author_name', 'created_at', 'updated_at',
            'is_published', 'views_count'
        ]
        read_only_fields = ['author', 'views_count', 'created_at', 'updated_at']
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return "Unknown"
    
    def create(self, validated_data):
        # Automatically set author to current user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class ArticleListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views"""
    specialty_name = serializers.CharField(source='specialty.name', read_only=True)
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'specialty_name', 'author_name',
            'is_published', 'views_count', 'created_at'
        ]
    
    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return "Unknown"