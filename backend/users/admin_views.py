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
        
        # Get all statistics using raw SQL for better performance
        from django.db import connection
                
        with connection.cursor() as cursor:
            # Single comprehensive query for all statistics
            cursor.execute("""
                SELECT 
                    -- User statistics
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM users WHERE user_type = 'citizen') as total_citizens,
                    (SELECT COUNT(*) FROM lawyer_profiles) as total_lawyers,
                    (SELECT COUNT(*) FROM lawyer_profiles WHERE is_verified = TRUE) as verified_lawyers,
                    (SELECT COUNT(*) FROM lawyer_profiles WHERE is_verified = FALSE) as pending_verification,
                    
                    -- Case request statistics
                    (SELECT COUNT(*) FROM case_requests) as total_case_requests,
                    (SELECT COUNT(*) FROM case_requests WHERE status = 'pending') as pending_requests,
                    (SELECT COUNT(*) FROM case_requests WHERE status = 'accepted') as accepted_requests,
                    (SELECT COUNT(*) FROM case_requests WHERE status = 'in_progress') as in_progress_cases,
                    (SELECT COUNT(*) FROM case_requests WHERE status = 'completed') as completed_cases,
                    (SELECT COUNT(*) FROM case_requests WHERE status = 'rejected') as rejected_requests,
                    
                    -- Case statistics
                    (SELECT COUNT(*) FROM cases) as total_cases,
                    (SELECT COUNT(*) FROM cases WHERE status = 'active') as active_cases,
                    
                    -- Hearing and update statistics
                    (SELECT COUNT(*) FROM hearings) as total_hearings,
                    (SELECT COUNT(*) FROM hearings WHERE hearing_date >= NOW()) as upcoming_hearings,
                    (SELECT COUNT(*) FROM case_updates) as total_case_updates,
                    
                    -- Message statistics
                    (SELECT COUNT(*) FROM messages) as total_messages,
                    (SELECT COUNT(*) FROM messages WHERE is_read = FALSE) as unread_messages
            """)
            
            row = cursor.fetchone()
            
            # User stats
            total_users = row[0]
            total_citizens = row[1]
            total_lawyers = row[2]
            verified_lawyers = row[3]
            pending_verification = row[4]
            
            # Case request stats
            total_case_requests = row[5]
            pending_requests = row[6]
            accepted_requests = row[7]
            in_progress_cases = row[8]
            completed_cases = row[9]
            rejected_requests = row[10]
            
            # Case stats
            total_cases = row[11]
            active_cases = row[12]
            
            # Hearing and update stats
            total_hearings = row[13]
            upcoming_hearings = row[14]
            total_case_updates = row[15]
            
            # Message stats
            total_messages = row[16]
            unread_messages = row[17]
        
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
        from django.db import connection

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    cr.id, 
                    cr.case_title,
                    cu.first_name || ' ' || cu.last_name as citizen_name,
                    lu.first_name || ' ' || lu.last_name as lawyer_name,
                    cr.status,
                    cr.request_date
                FROM case_requests cr
                INNER JOIN citizen_profiles cp ON cr.requester_id = cp.id
                INNER JOIN users cu ON cp.user_id = cu.id
                INNER JOIN lawyer_profiles lp ON cr.lawyer_id = lp.id
                INNER JOIN users lu ON lp.user_id = lu.id
                ORDER BY cr.request_date DESC
                LIMIT 10
            """)
            
            recent_requests_data = [
                {
                    'id': row[0],
                    'title': row[1],
                    'citizen': row[2],
                    'lawyer': row[3],
                    'status': row[4],
                    'date': row[5],
                }
                for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    c.id,
                    c.case_number,
                    c.title,
                    cu.first_name || ' ' || cu.last_name as citizen_name,
                    lu.first_name || ' ' || lu.last_name as lawyer_name,
                    c.status,
                    c.filing_date
                FROM cases c
                INNER JOIN citizen_profiles cp ON c.citizen_id = cp.id
                INNER JOIN users cu ON cp.user_id = cu.id
                INNER JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
                INNER JOIN users lu ON lp.user_id = lu.id
                ORDER BY c.filing_date DESC
                LIMIT 10
            """)
            
            recent_cases_data = [
                {
                    'id': row[0],
                    'case_number': row[1],
                    'title': row[2],
                    'citizen': row[3],
                    'lawyer': row[4],
                    'status': row[5],
                    'date': row[6],
                }
                for row in cursor.fetchall()
            ]

        activity = {
            'recent_requests': recent_requests_data,
            'recent_cases': recent_cases_data,
        }

        return Response(activity)