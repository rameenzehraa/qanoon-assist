from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count

from .models import LawyerProfile, User
from .serializers import LawyerProfileSerializer

class AdminDashboardViewSet(viewsets.ViewSet):
    """Admin-only endpoints for managing the platform"""
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        """Get dashboard statistics"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'total_lawyers': LawyerProfile.objects.count(),
            'verified_lawyers': LawyerProfile.objects.filter(is_verified=True).count(),
            'pending_verification': LawyerProfile.objects.filter(is_verified=False).count(),
            'total_citizens': User.objects.filter(user_type='citizen').count(),
            'total_users': User.objects.count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def pending_lawyers(self, request):
        """Get all lawyers pending verification"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        pending = LawyerProfile.objects.filter(is_verified=False).select_related('user')
        serializer = LawyerProfileSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data)