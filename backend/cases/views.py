from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import IntegrityError

from .models import CaseRequest, Case, CaseUpdate, Hearing
from .serializers import (
    CaseRequestSerializer, CaseSerializer, 
    CaseUpdateSerializer, HearingSerializer
)


class CaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CaseRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Citizens see their own requests
        if user.user_type == 'citizen':
            return CaseRequest.objects.filter(
                requester=user.citizen_profile
            ).select_related('requester__user', 'lawyer__user')
        
        # Lawyers see requests sent to them
        elif user.user_type == 'lawyer':
            return CaseRequest.objects.filter(
                lawyer=user.lawyer_profile
            ).select_related('requester__user', 'lawyer__user')
        
        # Admins see all
        elif user.user_type == 'admin':
            return CaseRequest.objects.all().select_related('requester__user', 'lawyer__user')
        
        return CaseRequest.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new case request (Citizens only)"""
        if request.user.user_type != 'citizen':
            return Response(
                {'error': 'Only citizens can create case requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return Response(
                {
                    'message': 'Case request sent successfully!',
                    'data': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {'error': 'You have already sent a request for this case to this lawyer'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Lawyer accepts a case request"""
        case_request = self.get_object()
        
        case_request.status = 'accepted'
        case_request.response_date = timezone.now()
        case_request.response_message = request.data.get('message', 'Request accepted')
        case_request.save()
        
        return Response({
            'message': 'Case request accepted',
            'data': self.get_serializer(case_request).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Lawyer rejects a case request"""
        case_request = self.get_object()
        
        case_request.status = 'rejected'
        case_request.response_date = timezone.now()
        case_request.response_message = request.data.get('message', 'Request rejected')
        case_request.save()
        
        return Response({
            'message': 'Case request rejected',
            'data': self.get_serializer(case_request).data
        })
    
    @action(detail=True, methods=['post'])
    def start_progress(self, request, pk=None):
        """Lawyer marks case as in progress and creates a Case"""
        case_request = self.get_object()
        
        # Update case request status
        case_request.status = 'in_progress'
        case_request.save()
        
        # Create a Case if it doesn't exist
        if not hasattr(case_request, 'case') or case_request.case_request is None:
            Case.objects.create(
                citizen=case_request.requester,
                lawyer=case_request.lawyer,
                case_request=case_request,
                title=case_request.case_title,
                description=case_request.description,
                status='active'
            )
        
        return Response({
            'message': 'Case status updated to in progress',
            'data': self.get_serializer(case_request).data
        })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Lawyer marks case as completed"""
        case_request = self.get_object()
        
        case_request.status = 'completed'
        case_request.save()
        
        return Response({
            'message': 'Case marked as completed',
            'data': self.get_serializer(case_request).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, pk=None):
        """Mark case request as viewed by citizen"""
        case_request = self.get_object()
        
        # Only citizens can mark as viewed
        if request.user.user_type != 'citizen':
            return Response(
                {'error': 'Only citizens can mark cases as viewed'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update last viewed timestamp
        case_request.last_viewed_at = timezone.now()
        case_request.save()
        
        return Response({
            'message': 'Case marked as viewed',
            'last_viewed_at': case_request.last_viewed_at
        })


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'citizen':
            return Case.objects.filter(citizen=user.citizen_profile)
        elif user.user_type == 'lawyer':
            return Case.objects.filter(lawyer=user.lawyer_profile)
        elif user.user_type == 'admin':
            return Case.objects.all()
        
        return Case.objects.none()


class HearingViewSet(viewsets.ModelViewSet):
    serializer_class = HearingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'citizen':
            return Hearing.objects.filter(case__citizen=user.citizen_profile)
        elif user.user_type == 'lawyer':
            return Hearing.objects.filter(case__lawyer=user.lawyer_profile)
        elif user.user_type == 'admin':
            return Hearing.objects.all()
        
        return Hearing.objects.none()
    
    def perform_create(self, serializer):
        # Only lawyers can create hearings
        if self.request.user.user_type != 'lawyer':
            raise PermissionError('Only lawyers can schedule hearings')
        serializer.save()


class CaseUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = CaseUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.user_type == 'citizen':
            return CaseUpdate.objects.filter(case__citizen=user.citizen_profile)
        elif user.user_type == 'lawyer':
            return CaseUpdate.objects.filter(case__lawyer=user.lawyer_profile)
        elif user.user_type == 'admin':
            return CaseUpdate.objects.all()
        
        return CaseUpdate.objects.none()
    
    def perform_create(self, serializer):
        # Only lawyers can create case updates
        if self.request.user.user_type != 'lawyer':
            raise PermissionError('Only lawyers can add case updates')
        serializer.save(created_by=self.request.user)