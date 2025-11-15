from django.db import models
from users.models import User, LawyerSpecialty

class Article(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    specialty = models.ForeignKey(LawyerSpecialty, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_articles')
    created_at = models.DateTimeField(auto_now_add=True)  # Fixed
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    views_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'articles'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title