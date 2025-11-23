from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CitizenProfile, LawyerProfile, AdminProfile, LawyerSpecialty, LawyerSpecialtyLink

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone_number')}),
    )

@admin.register(CitizenProfile)
class CitizenProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'cnic']
    search_fields = ['user__username', 'city', 'cnic']

@admin.register(LawyerProfile)
class LawyerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'bar_council_number', 'city', 'is_verified', 'consultation_fee']
    list_filter = ['is_verified', 'city']
    search_fields = ['user__username', 'bar_council_number']
    actions = ['verify_lawyers']
    
    def verify_lawyers(self, request, queryset):
        queryset.update(is_verified=True)
    verify_lawyers.short_description = "Verify selected lawyers"

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'employee_id']

@admin.register(LawyerSpecialty)
class LawyerSpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']