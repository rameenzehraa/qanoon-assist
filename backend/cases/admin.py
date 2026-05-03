from django.contrib import admin
from .models import CaseRequest, Case, Hearing, CaseUpdate, Notification, CaseAuditLog

@admin.register(CaseRequest)
class CaseRequestAdmin(admin.ModelAdmin):
    list_display = ['requester', 'lawyer', 'status', 'request_date']
    list_filter = ['status', 'request_date']
    search_fields = ['requester__user__username', 'lawyer__user__username']

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['case_number', 'title', 'citizen', 'lawyer', 'status', 'filing_date']
    list_filter = ['status', 'filing_date']
    search_fields = ['case_number', 'title', 'citizen__user__username', 'lawyer__user__username']

@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ['case', 'hearing_date', 'next_date', 'location']
    list_filter = ['hearing_date']
    search_fields = ['case__title', 'case__case_number']

@admin.register(CaseUpdate)
class CaseUpdateAdmin(admin.ModelAdmin):
    list_display = ['case', 'title', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['case__title', 'case__case_number', 'title']
    readonly_fields = ['created_at']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'is_read', 'related_case', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['user__username', 'message']
    readonly_fields = ['created_at']

@admin.register(CaseAuditLog)
class CaseAuditLogAdmin(admin.ModelAdmin):
    list_display = ['case_request', 'action', 'performed_by', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['case_request__case_title', 'action', 'performed_by__username']
    readonly_fields = ['timestamp']