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
        """Get case requests using raw SQL for citizens and lawyers"""
        user = self.request.user
        from django.db import connection
        
        # Citizens see their own requests (using raw SQL)
        if user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM case_requests 
                    WHERE requester_id = %s
                    ORDER BY request_date DESC
                """, [user.citizen_profile.id])
                
                columns = [col[0] for col in cursor.description]
                request_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                request_ids = [item['id'] for item in request_data]
                
                return CaseRequest.objects.filter(id__in=request_ids).select_related('requester__user', 'lawyer__user')
        
        # Lawyers see requests sent to them (using raw SQL)
        elif user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM case_requests 
                    WHERE lawyer_id = %s
                    ORDER BY request_date DESC
                """, [user.lawyer_profile.id])
                
                columns = [col[0] for col in cursor.description]
                request_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                request_ids = [item['id'] for item in request_data]
                
                return CaseRequest.objects.filter(id__in=request_ids).select_related('requester__user', 'lawyer__user')
        
        # Admins see all (using ORM)
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
        """Lawyer accepts a case request (using raw SQL UPDATE)"""
        case_request = self.get_object()
        from django.db import connection
        
        message = request.data.get('message', 'Request accepted')
        
        # Update using raw SQL
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE case_requests 
                SET status = 'accepted',
                    response_date = %s,
                    response_message = %s
                WHERE id = %s
            """, [timezone.now(), message, pk])
        
        # Refresh object for response
        case_request.refresh_from_db()
        
        return Response({
            'message': 'Case request accepted',
            'data': self.get_serializer(case_request).data
        })
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Lawyer rejects a case request (using raw SQL UPDATE)"""
        case_request = self.get_object()
        from django.db import connection
        
        message = request.data.get('message', 'Request rejected')
        
        # Update using raw SQL
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE case_requests 
                SET status = 'rejected',
                    response_date = %s,
                    response_message = %s
                WHERE id = %s
            """, [timezone.now(), message, pk])
        
        # Refresh object for response
        case_request.refresh_from_db()
        
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
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get case request statistics using raw SQL"""
        from django.db import connection
        user = request.user
        
        # For lawyers - get their stats
        if user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_requests,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
                        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                    FROM case_requests 
                    WHERE lawyer_id = %s
                """, [user.lawyer_profile.id])
                
                row = cursor.fetchone()
                stats_data = {
                    'total_requests': row[0],
                    'pending': row[1],
                    'accepted': row[2],
                    'in_progress': row[3],
                    'completed': row[4],
                    'rejected': row[5]
                }
        
        # For citizens - get their stats
        elif user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_requests,
                        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
                        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                    FROM case_requests 
                    WHERE requester_id = %s
                """, [user.citizen_profile.id])
                
                row = cursor.fetchone()
                stats_data = {
                    'total_requests': row[0],
                    'pending': row[1],
                    'accepted': row[2],
                    'in_progress': row[3],
                    'completed': row[4],
                    'rejected': row[5]
                }
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        return Response(stats_data)


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get cases using raw SQL for filtering"""
        user = self.request.user
        from django.db import connection
        
        if user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM cases 
                    WHERE citizen_id = %s
                    ORDER BY filing_date DESC
                """, [user.citizen_profile.id])
                
                columns = [col[0] for col in cursor.description]
                case_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                case_ids = [item['id'] for item in case_data]
                
                return Case.objects.filter(id__in=case_ids)
        
        elif user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT * FROM cases 
                    WHERE lawyer_id = %s
                    ORDER BY filing_date DESC
                """, [user.lawyer_profile.id])
                
                columns = [col[0] for col in cursor.description]
                case_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                case_ids = [item['id'] for item in case_data]
                
                return Case.objects.filter(id__in=case_ids)
        
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