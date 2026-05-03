from django.conf import settings
from django.db import models
from users.models import User, CitizenProfile, LawyerProfile
import datetime

class CaseRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    
    URGENCY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    requester = models.ForeignKey(CitizenProfile, on_delete=models.CASCADE, related_name='case_requests')
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE, related_name='received_requests')
    
    # Case details
    case_title = models.CharField(max_length=255)
    case_type = models.CharField(max_length=100)  # e.g., Criminal, Civil, Family
    description = models.TextField()
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='medium')
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
    response_message = models.TextField(blank=True)
    response_date = models.DateTimeField(null=True, blank=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'case_requests'
        ordering = ['-request_date']
        # Prevent duplicate requests
        unique_together = [['requester', 'lawyer', 'case_title']]
    
    def __str__(self):
        return f"{self.case_title} - {self.requester.user.username} to {self.lawyer.user.username}"


class Case(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('pending', 'Pending'),
    )
    
    citizen = models.ForeignKey(CitizenProfile, on_delete=models.CASCADE, related_name='cases')
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE, related_name='cases')
    case_request = models.OneToOneField(CaseRequest, on_delete=models.SET_NULL, null=True, blank=True)
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    case_number = models.CharField(max_length=50, unique=True, blank=True)
    filing_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    class Meta:
        db_table = 'cases'
        ordering = ['-filing_date']
    
    def __str__(self):
        return f"{self.title} - {self.case_number}"
    
    def save(self, *args, **kwargs):
        if not self.case_number:
            import random
            temp_id = random.randint(1000, 9999)
            self.case_number = f"QA-{datetime.datetime.now().year}-{temp_id}"
        super().save(*args, **kwargs)


class CaseUpdate(models.Model):
    """Track case progress updates"""
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'case_updates'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.case.title} - {self.title}"


class Hearing(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    title = models.CharField(max_length=255, default='Court Hearing')
    hearing_date = models.DateTimeField()
    location = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    next_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hearings'
        ordering = ['-hearing_date']
    
    def __str__(self):
        return f"Hearing for {self.case.title} on {self.hearing_date}"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_case = models.ForeignKey(
        CaseRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"


class CaseAuditLog(models.Model):
    case_request = models.ForeignKey(
        CaseRequest,
        on_delete=models.CASCADE,
        related_name='audit_logs',
    )
    action = models.CharField(max_length=100)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs',
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'case_audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} on {self.case_request} at {self.timestamp}"