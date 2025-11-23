from django.db import models

class LegalCategory(models.Model):
    """Categories like Criminal Law, Family Law, etc."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Legal Categories"

    def __str__(self):
        return self.name


class LegalArticle(models.Model):
    """Individual laws/articles with keywords"""
    title = models.CharField(max_length=200)
    article_number = models.CharField(max_length=50, unique=True)  # e.g., "Section 302 PPC"
    category = models.ForeignKey(LegalCategory, on_delete=models.CASCADE, related_name='articles')
    content = models.TextField()  # Full text of the article
    keywords = models.CharField(max_length=500, help_text="Comma-separated keywords for search")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['article_number']

    def __str__(self):
        return f"{self.article_number} - {self.title}"