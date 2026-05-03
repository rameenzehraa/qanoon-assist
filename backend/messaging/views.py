from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Message
from .serializers import MessageSerializer
from repositories import MessageRepository, CaseRepository

message_repo = MessageRepository()
case_repo = CaseRepository()


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_type == 'citizen':
            return (
                Message.objects
                .filter(case_request__requester__user=user)
                .select_related('sender', 'case_request')
                .order_by('-timestamp')
            )
        elif user.user_type == 'lawyer':
            return (
                Message.objects
                .filter(case_request__lawyer__user=user)
                .select_related('sender', 'case_request')
                .order_by('-timestamp')
            )
        elif user.user_type == 'admin':
            return message_repo.get_all_messages()

        return Message.objects.none()

    def create(self, request, *args, **kwargs):
        case_request_id = request.data.get('case_request')
        case_request = case_repo.get_case_request_by_id(case_request_id)

        if not case_request:
            return Response({'error': 'Case request not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.user_type == 'citizen' and case_request.requester.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.user_type == 'lawyer' and case_request.lawyer.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_case(self, request):
        case_request_id = request.query_params.get('case_request_id')

        if not case_request_id:
            return Response({'error': 'case_request_id parameter required'}, status=status.HTTP_400_BAD_REQUEST)

        case_request = case_repo.get_case_request_by_id(case_request_id)
        if not case_request:
            return Response({'error': 'Case request not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.user_type == 'citizen' and case_request.requester.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.user_type == 'lawyer' and case_request.lawyer.user != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        messages = message_repo.get_messages_for_case(case_request)
        message_repo.mark_as_read(case_request, reader=user)

        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        return Response({'unread_count': message_repo.get_unread_count(request.user)})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(message_repo.get_stats_for_user(request.user))
