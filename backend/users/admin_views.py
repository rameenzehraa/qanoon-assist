from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import LawyerProfile
from .serializers import LawyerProfileSerializer
from repositories import UserRepository

User = get_user_model()
user_repo = UserRepository()


class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        from cases.models import CaseRequest, Case, Hearing, CaseUpdate
        from messaging.models import Message

        stats = {
            'total_users': User.objects.count(),
            'total_citizens': User.objects.filter(user_type='citizen').count(),
            'total_lawyers': LawyerProfile.objects.count(),
            'verified_lawyers': LawyerProfile.objects.filter(is_verified=True).count(),
            'pending_verification': LawyerProfile.objects.filter(is_verified=False).count(),

            'total_case_requests': CaseRequest.objects.count(),
            'pending_requests': CaseRequest.objects.filter(status='pending').count(),
            'accepted_requests': CaseRequest.objects.filter(status='accepted').count(),
            'in_progress_cases': CaseRequest.objects.filter(status='in_progress').count(),
            'completed_cases': CaseRequest.objects.filter(status='completed').count(),
            'rejected_requests': CaseRequest.objects.filter(status='rejected').count(),

            'total_cases': Case.objects.count(),
            'active_cases': Case.objects.filter(status='active').count(),

            'total_hearings': Hearing.objects.count(),
            'upcoming_hearings': Hearing.objects.filter(hearing_date__gte=timezone.now()).count(),
            'total_case_updates': CaseUpdate.objects.count(),

            'total_messages': Message.objects.count(),
            'unread_messages': Message.objects.filter(is_read=False).count(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'])
    def pending_lawyers(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        pending = user_repo.get_unverified_lawyers()
        serializer = LawyerProfileSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)

        from cases.models import CaseRequest, Case

        recent_requests = (
            CaseRequest.objects
            .select_related('requester__user', 'lawyer__user')
            .order_by('-request_date')[:10]
        )
        recent_cases = (
            Case.objects
            .select_related('citizen__user', 'lawyer__user')
            .order_by('-filing_date')[:10]
        )

        return Response({
            'recent_requests': [
                {
                    'id': cr.id,
                    'title': cr.case_title,
                    'citizen': cr.requester.user.get_full_name(),
                    'lawyer': cr.lawyer.user.get_full_name(),
                    'status': cr.status,
                    'date': cr.request_date,
                }
                for cr in recent_requests
            ],
            'recent_cases': [
                {
                    'id': c.id,
                    'case_number': c.case_number,
                    'title': c.title,
                    'citizen': c.citizen.user.get_full_name(),
                    'lawyer': c.lawyer.user.get_full_name(),
                    'status': c.status,
                    'date': c.filing_date,
                }
                for c in recent_cases
            ],
        })
