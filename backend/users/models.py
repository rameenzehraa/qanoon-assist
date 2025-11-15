from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    USER_TYPES = (
        ('citizen', 'Citizen'),
        ('lawyer', 'Lawyer'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPES)
    phone_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Fixed
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"


class CitizenProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='citizen_profile')
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    cnic = models.CharField(max_length=15, unique=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'citizen_profiles'
    
    def __str__(self):
        return f"{self.user.username} - Citizen Profile"


class LawyerSpecialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Fixed
    
    class Meta:
        db_table = 'lawyer_specialties'
        verbose_name_plural = 'Lawyer Specialties'
    
    def __str__(self):
        return self.name


class LawyerProfile(models.Model):
    """Extended profile for lawyers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lawyer_profile')
    bar_council_number = models.CharField(max_length=50, unique=True)
    experience_years = models.IntegerField()
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    city = models.CharField(max_length=100)
    specialties = models.ManyToManyField(LawyerSpecialty, through='LawyerSpecialtyLink')
    
    # NEW FIELDS - with proper field lengths and nullable for existing records
    cnic = models.CharField(
        max_length=20,  # Increased to 20 for safety
        unique=True, 
        null=True,  # Allow null for existing records
        blank=True,
        help_text="XXXXX-XXXXXXX-X"
    )
    address = models.TextField(
        null=True,  # Allow null for existing records
        blank=True,
        help_text="Complete address"
    )
    profile_picture = models.ImageField(
        upload_to='lawyer_profiles/', 
        null=True, 
        blank=True
    )
    
    # Additional fields for verification
    verification_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_lawyers'
    )
    
    class Meta:
        db_table = 'lawyer_profiles'
    
    def __str__(self):
        return f"{self.user.username} - Lawyer Profile"

class LawyerSpecialtyLink(models.Model):
    lawyer = models.ForeignKey(LawyerProfile, on_delete=models.CASCADE)
    specialty = models.ForeignKey(LawyerSpecialty, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'lawyer_specialty_link'
        unique_together = ('lawyer', 'specialty')
    
    def __str__(self):
        return f"{self.lawyer.user.username} - {self.specialty.name}"


class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    department = models.CharField(max_length=100, default='General')
    employee_id = models.CharField(max_length=50, unique=True, blank=True)
    
    class Meta:
        db_table = 'admin_profiles'
    
    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = f"ADMIN{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - Admin Profile"