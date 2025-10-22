from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom User Model
class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('citizen', 'Citizen'),
        ('lawyer', 'Lawyer'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"


# Citizen Profile
class CitizenProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='citizen_profile')
    address = models.TextField()
    city = models.CharField(max_length=100)
    cnic = models.CharField(max_length=15, unique=True)
    
    def __str__(self):
        return f"Citizen: {self.user.username}"


# Legal Specialties
class LawyerSpecialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Lawyer Specialties"
    
    def __str__(self):
        return self.name


# Lawyer Profile
class LawyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    bar_council_number = models.CharField(max_length=50, unique=True)
    experience_years = models.IntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    specialties = models.ManyToManyField(LawyerSpecialty, related_name='lawyers')
    office_address = models.TextField()
    city = models.CharField(max_length=100)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    bio = models.TextField(blank=True)
    
    def __str__(self):
        return f"Lawyer: {self.user.username} - {'Verified' if self.is_verified else 'Pending'}"


# Admin Profile
class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    role_description = models.CharField(max_length=200)
    department = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"Admin: {self.user.username}"


# Case Request
class CaseRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('denied', 'Denied'),
    )
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='case_requests_made')
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='case_requests_received')
    title = models.CharField(max_length=200)
    description = models.TextField()
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    response_date = models.DateTimeField(null=True, blank=True)
    denial_reason = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.requester.username} to {self.lawyer.username}"


# Case
class Case(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('on_hold', 'On Hold'),
    )
    
    citizen = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases_as_citizen')
    lawyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases_as_lawyer')
    case_request = models.OneToOneField(CaseRequest, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    case_number = models.CharField(max_length=50, unique=True)
    filing_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    court_name = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.case_number} - {self.title}"


# Hearing
class Hearing(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    hearing_date = models.DateTimeField()
    hearing_notes = models.TextField(blank=True)
    next_hearing_date = models.DateTimeField(null=True, blank=True)
    outcome = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-hearing_date']
    
    def __str__(self):
        return f"{self.case.case_number} - {self.hearing_date.strftime('%Y-%m-%d')}"


# Message
class Message(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    attachment = models.FileField(upload_to='message_attachments/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} on {self.case.case_number}"


# Article (Knowledge Base)
class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    specialty = models.ForeignKey(LawyerSpecialty, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authored_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title