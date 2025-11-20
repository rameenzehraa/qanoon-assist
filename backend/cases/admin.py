from django.contrib import admin
from .models import CaseRequest, Case, Hearing, CaseUpdate

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