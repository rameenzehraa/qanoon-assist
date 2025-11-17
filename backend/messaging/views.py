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
        user = self.request.user
        
        # Users can only see messages from their own case requests
        if user.user_type == 'citizen':
            return Message.objects.filter(
                case_request__requester__user=user
            ).select_related('sender', 'case_request')
        
        elif user.user_type == 'lawyer':
            return Message.objects.filter(
                case_request__lawyer__user=user
            ).select_related('sender', 'case_request')
        
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
        """Get all messages for a specific case request"""
        case_request_id = request.query_params.get('case_request_id')
        
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
        
        # Get messages
        messages = Message.objects.filter(
            case_request_id=case_request_id
        ).order_by('timestamp')
        
        # Mark messages as read (except sender's own messages)
        Message.objects.filter(
            case_request_id=case_request_id,
            is_read=False
        ).exclude(sender=user).update(is_read=True)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)