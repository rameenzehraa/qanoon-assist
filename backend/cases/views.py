from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError

from .models import CaseRequest, Case, CaseUpdate, Hearing
from .serializers import (
    CaseRequestSerializer, CaseSerializer,
    CaseUpdateSerializer, HearingSerializer
)
from repositories import CaseRepository

case_repo = CaseRepository()


class CaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CaseRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'citizen':
            return case_repo.get_requests_for_citizen(user.citizen_profile)
        elif user.user_type == 'lawyer':
            return case_repo.get_requests_for_lawyer(user.lawyer_profile)
        elif user.user_type == 'admin':
            return case_repo.get_all_requests()

        return CaseRequest.objects.none()

    def create(self, request, *args, **kwargs):
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
                {'message': 'Case request sent successfully!', 'data': serializer.data},
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            return Response(
                {'error': 'You have already sent a request for this case to this lawyer'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        case_request = self.get_object()
        message = request.data.get('message', 'Request accepted')
        case_request = case_repo.accept_request(case_request, message=message, performed_by=request.user)
        return Response({
            'message': 'Case request accepted',
            'data': self.get_serializer(case_request).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        case_request = self.get_object()
        message = request.data.get('message', 'Request rejected')
        case_request = case_repo.reject_request(case_request, message=message, performed_by=request.user)
        return Response({
            'message': 'Case request rejected',
            'data': self.get_serializer(case_request).data
        })

    @action(detail=True, methods=['post'])
    def start_progress(self, request, pk=None):
        case_request = self.get_object()
        case_repo.mark_in_progress(case_request, performed_by=request.user)
        case_repo.create_case_from_request(case_request, performed_by=request.user)
        return Response({
            'message': 'Case status updated to in progress',
            'data': self.get_serializer(case_request).data
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        case_request = self.get_object()
        case_repo.mark_complete(case_request, performed_by=request.user)
        return Response({
            'message': 'Case marked as completed',
            'data': self.get_serializer(case_request).data
        })

    @action(detail=True, methods=['post'])
    def mark_viewed(self, request, pk=None):
        if request.user.user_type != 'citizen':
            return Response(
                {'error': 'Only citizens can mark cases as viewed'},
                status=status.HTTP_403_FORBIDDEN
            )

        case_request = self.get_object()
        case_repo.mark_viewed(case_request)
        return Response({
            'message': 'Case marked as viewed',
            'last_viewed_at': case_request.last_viewed_at
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user

        if user.user_type == 'lawyer':
            return Response(case_repo.get_request_stats(user.lawyer_profile, role='lawyer'))
        elif user.user_type == 'citizen':
            return Response(case_repo.get_request_stats(user.citizen_profile, role='citizen'))

        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'citizen':
            return case_repo.get_cases_for_citizen(user.citizen_profile)
        elif user.user_type == 'lawyer':
            return case_repo.get_cases_for_lawyer(user.lawyer_profile)
        elif user.user_type == 'admin':
            return case_repo.get_all_cases()

        return Case.objects.none()


class HearingViewSet(viewsets.ModelViewSet):
    serializer_class = HearingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'citizen':
            return case_repo.get_hearings_for_citizen(user.citizen_profile)
        elif user.user_type == 'lawyer':
            return case_repo.get_hearings_for_lawyer(user.lawyer_profile)
        elif user.user_type == 'admin':
            return case_repo.get_all_hearings()

        from cases.models import Hearing
        return Hearing.objects.none()

    def perform_create(self, serializer):
        if self.request.user.user_type != 'lawyer':
            raise PermissionError('Only lawyers can schedule hearings')
        serializer.save()


class CaseUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = CaseUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'citizen':
            return case_repo.get_updates_for_citizen(user.citizen_profile)
        elif user.user_type == 'lawyer':
            return case_repo.get_updates_for_lawyer(user.lawyer_profile)
        elif user.user_type == 'admin':
            return case_repo.get_all_updates()

        from cases.models import CaseUpdate
        return CaseUpdate.objects.none()

    def perform_create(self, serializer):
        if self.request.user.user_type != 'lawyer':
            raise PermissionError('Only lawyers can add case updates')
        serializer.save(created_by=self.request.user)
