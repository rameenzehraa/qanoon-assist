from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, CitizenProfile, LawyerProfile, AdminProfile,
    LawyerSpecialty, CaseRequest, Case, Hearing, Message, Article
)

# Custom User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('user_type', 'phone_number', 'profile_picture')}),
    )


# Citizen Profile Admin
@admin.register(CitizenProfile)
class CitizenProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'cnic']
    search_fields = ['user__username', 'cnic', 'city']
    list_filter = ['city']


# Lawyer Specialty Admin
@admin.register(LawyerSpecialty)
class LawyerSpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


# Lawyer Profile Admin
@admin.register(LawyerProfile)
class LawyerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'bar_council_number', 'is_verified', 'city', 'consultation_fee']
    list_filter = ['is_verified', 'city', 'verification_date']
    search_fields = ['user__username', 'bar_council_number']
    filter_horizontal = ['specialties']
    
    actions = ['verify_lawyers', 'unverify_lawyers']
    
    def verify_lawyers(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_verified=True, verification_date=timezone.now())
        self.message_user(request, f'{updated} lawyer(s) verified successfully.')
    verify_lawyers.short_description = 'Verify selected lawyers'
    
    def unverify_lawyers(self, request, queryset):
        updated = queryset.update(is_verified=False, verification_date=None)
        self.message_user(request, f'{updated} lawyer(s) unverified.')
    unverify_lawyers.short_description = 'Unverify selected lawyers'


# Admin Profile Admin
@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'role_description', 'department']
    search_fields = ['user__username', 'role_description']


# Case Request Admin
@admin.register(CaseRequest)
class CaseRequestAdmin(admin.ModelAdmin):
    list_display = ['title', 'requester', 'lawyer', 'status', 'request_date']
    list_filter = ['status', 'request_date']
    search_fields = ['title', 'requester__username', 'lawyer__username']
    date_hierarchy = 'request_date'


# Case Admin
@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['case_number', 'title', 'citizen', 'lawyer', 'status', 'filing_date']
    list_filter = ['status', 'filing_date', 'court_name']
    search_fields = ['case_number', 'title', 'citizen__username', 'lawyer__username']
    date_hierarchy = 'filing_date'


# Hearing Admin
@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ['case', 'hearing_date', 'next_hearing_date', 'outcome']
    list_filter = ['hearing_date']
    search_fields = ['case__case_number', 'case__title']
    date_hierarchy = 'hearing_date'


# Message Admin
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['case', 'sender', 'timestamp', 'is_read']
    list_filter = ['is_read', 'timestamp']
    search_fields = ['case__case_number', 'sender__username', 'content']
    date_hierarchy = 'timestamp'


# Article Admin
@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'specialty', 'author', 'is_published', 'views', 'created_at']
    list_filter = ['is_published', 'specialty', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'