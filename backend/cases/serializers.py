from rest_framework import serializers

from .models import CaseRequest, Case, CaseUpdate, Hearing
from users.serializers import UserSerializer, LawyerProfileSerializer, CitizenProfileSerializer


class CaseRequestSerializer(serializers.ModelSerializer):
    requester_details = CitizenProfileSerializer(source='requester', read_only=True)
    lawyer_details = LawyerProfileSerializer(source='lawyer', read_only=True)
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.user.get_full_name', read_only=True)
    unread_messages_count = serializers.SerializerMethodField()
    case_id = serializers.SerializerMethodField()
    has_new_updates = serializers.SerializerMethodField()

    class Meta:
        model = CaseRequest
        fields = [
            'id', 'requester', 'lawyer', 'case_title', 'case_type',
            'description', 'urgency', 'status', 'request_date',
            'response_message', 'response_date', 'requester_details',
            'lawyer_details', 'requester_name', 'lawyer_name',
            'unread_messages_count', 'case_id', 'last_viewed_at', 'has_new_updates',
        ]
        read_only_fields = ['requester', 'status', 'request_date', 'response_date']

    def get_unread_messages_count(self, obj):
        """
        Count unread messages using the prefetched 'messages' cache.
        Avoids an extra DB hit per row.
        """
        request = self.context.get('request')
        if not request:
            return 0
        user = request.user
        return sum(
            1 for m in obj.messages.all()
            if not m.is_read and m.sender_id != user.id
        )

    def get_case_id(self, obj):
        """
        Return the linked Case id using the prefetched OneToOne reverse.
        No extra query — uses the prefetch cache populated by get_queryset.
        """
        try:
            return obj.case.id
        except Case.DoesNotExist:
            return None

    def get_has_new_updates(self, obj):
        """
        Delegate to CaseRepository.has_new_updates, which works against
        prefetched hearings/updates — no extra DB queries per row.
        Only meaningful for citizens.
        """
        request = self.context.get('request')
        if not request or request.user.user_type != 'citizen':
            return False

        from repositories import CaseRepository
        return CaseRepository().has_new_updates(obj, since=obj.last_viewed_at)

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['requester'] = request.user.citizen_profile
        return super().create(validated_data)


class CaseUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = CaseUpdate
        fields = ['id', 'case', 'title', 'description', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class HearingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hearing
        fields = ['id', 'case', 'title', 'hearing_date', 'location', 'notes', 'next_date', 'created_at']
        read_only_fields = ['created_at']


class CaseSerializer(serializers.ModelSerializer):
    citizen_details = CitizenProfileSerializer(source='citizen', read_only=True)
    lawyer_details = LawyerProfileSerializer(source='lawyer', read_only=True)
    hearings = HearingSerializer(many=True, read_only=True)
    updates = CaseUpdateSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'citizen', 'lawyer', 'case_request', 'title',
            'description', 'case_number', 'filing_date', 'status',
            'citizen_details', 'lawyer_details', 'hearings', 'updates',
        ]
        read_only_fields = ['case_number', 'filing_date']
