from rest_framework import serializers
from .models import Message
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'case_request', 'sender', 'content', 'attachment',
            'timestamp', 'is_read', 'sender_details', 'sender_name'
        ]
        read_only_fields = ['sender', 'timestamp']
    
    def create(self, validated_data):
        # Set sender from request context
        request = self.context.get('request')
        validated_data['sender'] = request.user
        return super().create(validated_data)