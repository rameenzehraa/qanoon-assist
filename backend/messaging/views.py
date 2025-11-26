from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer
from cases.models import CaseRequest


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get messages using raw SQL with JOIN for access control"""
        user = self.request.user
        from django.db import connection
        
        # Users can only see messages from their own case requests
        if user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT m.* FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN citizen_profiles cp ON cr.requester_id = cp.id
                    WHERE cp.user_id = %s
                    ORDER BY m.timestamp DESC
                """, [user.id])
                
                columns = [col[0] for col in cursor.description]
                message_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                message_ids = [item['id'] for item in message_data]
                
                return Message.objects.filter(id__in=message_ids).select_related('sender', 'case_request')
        
        elif user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT m.* FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN lawyer_profiles lp ON cr.lawyer_id = lp.id
                    WHERE lp.user_id = %s
                    ORDER BY m.timestamp DESC
                """, [user.id])
                
                columns = [col[0] for col in cursor.description]
                message_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
                message_ids = [item['id'] for item in message_data]
                
                return Message.objects.filter(id__in=message_ids).select_related('sender', 'case_request')
        
        elif user.user_type == 'admin':
            return Message.objects.all().select_related('sender', 'case_request')
        
        return Message.objects.none()
    
    def create(self, request, *args, **kwargs):
        """Send a new message"""
        case_request_id = request.data.get('case_request')
        
        # Verify user has access to this case request
        try:
            case_request = CaseRequest.objects.get(id=case_request_id)
        except CaseRequest.DoesNotExist:
            return Response(
                {'error': 'Case request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is part of this case
        user = request.user
        if user.user_type == 'citizen':
            if case_request.requester.user != user:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.user_type == 'lawyer':
            if case_request.lawyer.user != user:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def by_case(self, request):
        """Get all messages for a specific case request (using raw SQL)"""
        case_request_id = request.query_params.get('case_request_id')
        from django.db import connection
        
        if not case_request_id:
            return Response(
                {'error': 'case_request_id parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify access
        try:
            case_request = CaseRequest.objects.get(id=case_request_id)
        except CaseRequest.DoesNotExist:
            return Response(
                {'error': 'Case request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        user = request.user
        if user.user_type == 'citizen':
            if case_request.requester.user != user:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.user_type == 'lawyer':
            if case_request.lawyer.user != user:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get messages using raw SQL
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT * FROM messages 
                WHERE case_request_id = %s
                ORDER BY timestamp ASC
            """, [case_request_id])
            
            columns = [col[0] for col in cursor.description]
            message_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
            message_ids = [item['id'] for item in message_data]
        
        # Mark messages as read using raw SQL (except sender's own messages)
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE messages 
                SET is_read = TRUE
                WHERE case_request_id = %s 
                AND is_read = FALSE 
                AND sender_id != %s
            """, [case_request_id, user.id])
        
        # Get message objects for serialization
        messages = Message.objects.filter(id__in=message_ids).order_by('timestamp')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages using raw SQL"""
        from django.db import connection
        user = request.user
        
        if user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN citizen_profiles cp ON cr.requester_id = cp.id
                    WHERE cp.user_id = %s 
                    AND m.is_read = FALSE 
                    AND m.sender_id != %s
                """, [user.id, user.id])
                
                unread_count = cursor.fetchone()[0]
        
        elif user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN lawyer_profiles lp ON cr.lawyer_id = lp.id
                    WHERE lp.user_id = %s 
                    AND m.is_read = FALSE 
                    AND m.sender_id != %s
                """, [user.id, user.id])
                
                unread_count = cursor.fetchone()[0]
        else:
            unread_count = 0
        
        return Response({'unread_count': unread_count})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get message statistics using raw SQL"""
        from django.db import connection
        user = request.user
        
        if user.user_type == 'citizen':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_messages,
                        COUNT(CASE WHEN m.is_read = FALSE AND m.sender_id != %s THEN 1 END) as unread,
                        COUNT(CASE WHEN m.sender_id = %s THEN 1 END) as sent,
                        COUNT(CASE WHEN m.sender_id != %s THEN 1 END) as received
                    FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN citizen_profiles cp ON cr.requester_id = cp.id
                    WHERE cp.user_id = %s
                """, [user.id, user.id, user.id, user.id])
                
                row = cursor.fetchone()
                stats_data = {
                    'total_messages': row[0],
                    'unread': row[1],
                    'sent': row[2],
                    'received': row[3]
                }
        
        elif user.user_type == 'lawyer':
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_messages,
                        COUNT(CASE WHEN m.is_read = FALSE AND m.sender_id != %s THEN 1 END) as unread,
                        COUNT(CASE WHEN m.sender_id = %s THEN 1 END) as sent,
                        COUNT(CASE WHEN m.sender_id != %s THEN 1 END) as received
                    FROM messages m
                    INNER JOIN case_requests cr ON m.case_request_id = cr.id
                    INNER JOIN lawyer_profiles lp ON cr.lawyer_id = lp.id
                    WHERE lp.user_id = %s
                """, [user.id, user.id, user.id, user.id])
                
                row = cursor.fetchone()
                stats_data = {
                    'total_messages': row[0],
                    'unread': row[1],
                    'sent': row[2],
                    'received': row[3]
                }
        else:
            stats_data = {
                'total_messages': 0,
                'unread': 0,
                'sent': 0,
                'received': 0
            }
        
        return Response(stats_data)