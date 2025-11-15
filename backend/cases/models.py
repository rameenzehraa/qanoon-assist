from django.db import models
from users.models import User, CitizenProfile, LawyerProfile
import datetime

class CaseRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    )
    
    requester = models.ForeignKey(CitizenProfile, on_delete=models.CASCADE, related_name='case_requests')
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE, related_name='received_requests')
    description = models.TextField()
    request_date = models.DateTimeField(auto_now_add=True)  # Fixed
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    response_message = models.TextField(blank=True)
    response_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'case_requests'
        ordering = ['-request_date']
    
    def __str__(self):
        return f"Request from {self.requester.user.username} to {self.lawyer.user.username}"


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
    filing_date = models.DateTimeField(auto_now_add=True)  # Fixed
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    class Meta:
        db_table = 'cases'
        ordering = ['-filing_date']
    
    def __str__(self):
        return f"{self.title} - {self.case_number}"
    
    def save(self, *args, **kwargs):
        if not self.case_number:
            # Generate case number before first save
            import random
            temp_id = random.randint(1000, 9999)
            self.case_number = f"QA-{datetime.datetime.now().year}-{temp_id}"
        super().save(*args, **kwargs)


class Hearing(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    hearing_date = models.DateTimeField()
    hearing_notes = models.TextField(blank=True)
    next_date = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Fixed
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hearings'
        ordering = ['-hearing_date']
    
    def __str__(self):
        return f"Hearing for {self.case.title} on {self.hearing_date}"