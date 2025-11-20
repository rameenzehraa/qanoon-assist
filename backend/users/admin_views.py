from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q

from .models import LawyerProfile, User
from .serializers import LawyerProfileSerializer

class AdminDashboardViewSet(viewsets.ViewSet):
    """Admin-only endpoints for managing the platform"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get dashboard statistics"""
        print(f"Admin dashboard request from user: {request.user}")  # DEBUG
        print(f"User type: {request.user.user_type}")  # DEBUG
        print(f"Is authenticated: {request.user.is_authenticated}")  # DEBUG
        
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Import models here to avoid circular imports
        from cases.models import CaseRequest, Case, Hearing, CaseUpdate
        from messaging.models import Message
        
        # User statistics
        total_users = User.objects.count()
        total_citizens = User.objects.filter(user_type='citizen').count()
        total_lawyers = LawyerProfile.objects.count()
        verified_lawyers = LawyerProfile.objects.filter(is_verified=True).count()
        pending_verification = LawyerProfile.objects.filter(is_verified=False).count()
        
        # Case statistics
        total_case_requests = CaseRequest.objects.count()
        pending_requests = CaseRequest.objects.filter(status='pending').count()
        accepted_requests = CaseRequest.objects.filter(status='accepted').count()
        in_progress_cases = CaseRequest.objects.filter(status='in_progress').count()
        completed_cases = CaseRequest.objects.filter(status='completed').count()
        rejected_requests = CaseRequest.objects.filter(status='rejected').count()
        
        # Active cases (Case model)
        total_cases = Case.objects.count()
        active_cases = Case.objects.filter(status='active').count()
        
        # Hearings and updates
        total_hearings = Hearing.objects.count()
        upcoming_hearings = Hearing.objects.filter(hearing_date__gte=timezone.now()).count()
        total_case_updates = CaseUpdate.objects.count()
        
        # Messaging statistics
        total_messages = Message.objects.count()
        unread_messages = Message.objects.filter(is_read=False).count()
        
        stats = {
            # User stats
            'total_users': total_users,
            'total_citizens': total_citizens,
            'total_lawyers': total_lawyers,
            'verified_lawyers': verified_lawyers,
            'pending_verification': pending_verification,
            
            # Case request stats
            'total_case_requests': total_case_requests,
            'pending_requests': pending_requests,
            'accepted_requests': accepted_requests,
            'in_progress_cases': in_progress_cases,
            'completed_cases': completed_cases,
            'rejected_requests': rejected_requests,
            
            # Case stats
            'total_cases': total_cases,
            'active_cases': active_cases,
            
            # Hearing and update stats
            'total_hearings': total_hearings,
            'upcoming_hearings': upcoming_hearings,
            'total_case_updates': total_case_updates,
            
            # Message stats
            'total_messages': total_messages,
            'unread_messages': unread_messages,
        }
        
        print(f"Returning stats: {stats}")  # DEBUG
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def pending_lawyers(self, request):
        """Get all lawyers pending verification"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        pending = LawyerProfile.objects.filter(is_verified=False).select_related('user')
        serializer = LawyerProfileSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Get recent platform activity"""
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        from cases.models import CaseRequest, Case
        
        # Get recent case requests (last 10)
        recent_requests = CaseRequest.objects.select_related(
            'requester__user', 'lawyer__user'
        ).order_by('-request_date')[:10]
        
        # Get recent cases (last 10)
        recent_cases = Case.objects.select_related(
            'citizen__user', 'lawyer__user'
        ).order_by('-filing_date')[:10]
        
        activity = {
            'recent_requests': [
                {
                    'id': req.id,
                    'title': req.case_title,
                    'citizen': req.requester.user.get_full_name(),
                    'lawyer': req.lawyer.user.get_full_name(),
                    'status': req.status,
                    'date': req.request_date,
                }
                for req in recent_requests
            ],
            'recent_cases': [
                {
                    'id': case.id,
                    'case_number': case.case_number,
                    'title': case.title,
                    'citizen': case.citizen.user.get_full_name(),
                    'lawyer': case.lawyer.user.get_full_name(),
                    'status': case.status,
                    'date': case.filing_date,
                }
                for case in recent_cases
            ],
        }
        
        return Response(activity)