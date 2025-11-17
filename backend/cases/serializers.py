from rest_framework import serializers
from .models import CaseRequest, Case, CaseUpdate, Hearing
from users.serializers import UserSerializer, LawyerProfileSerializer, CitizenProfileSerializer

class CaseRequestSerializer(serializers.ModelSerializer):
    requester_details = CitizenProfileSerializer(source='requester', read_only=True)
    lawyer_details = LawyerProfileSerializer(source='lawyer', read_only=True)
    requester_name = serializers.CharField(source='requester.user.get_full_name', read_only=True)
    lawyer_name = serializers.CharField(source='lawyer.user.get_full_name', read_only=True)
    unread_messages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseRequest
        fields = [
            'id', 'requester', 'lawyer', 'case_title', 'case_type', 
            'description', 'urgency', 'status', 'request_date',
            'response_message', 'response_date', 'requester_details',
            'lawyer_details', 'requester_name', 'lawyer_name', 'unread_messages_count'
        ]
        read_only_fields = ['requester', 'status', 'request_date', 'response_date']
    
    def get_unread_messages_count(self, obj):
        """Get count of unread messages for current user"""
        request = self.context.get('request')
        if not request or not request.user:
            return 0
        
        from messaging.models import Message
        
        # Count messages NOT sent by current user and not read
        return Message.objects.filter(
            case_request=obj,
            is_read=False
        ).exclude(sender=request.user).count()
    
    def create(self, validated_data):
        # Get the citizen profile from the logged-in user
        request = self.context.get('request')
        citizen_profile = request.user.citizen_profile
        validated_data['requester'] = citizen_profile
        
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
            'citizen_details', 'lawyer_details', 'hearings', 'updates'
        ]
        read_only_fields = ['case_number', 'filing_date']