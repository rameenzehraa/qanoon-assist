from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, CitizenProfile, LawyerProfile, AdminProfile,
    LawyerSpecialty, CaseRequest, Case, Hearing, Message, Article
)


# User Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'user_type', 'phone_number', 'profile_picture', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 
                  'last_name', 'user_type', 'phone_number']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


# Profile Serializers
class CitizenProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CitizenProfile
        fields = ['id', 'user', 'address', 'city', 'cnic']


class LawyerSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerSpecialty
        fields = ['id', 'name', 'description']


class LawyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialties = LawyerSpecialtySerializer(many=True, read_only=True)
    specialty_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=LawyerSpecialty.objects.all(),
        write_only=True,
        source='specialties'
    )
    
    class Meta:
        model = LawyerProfile
        fields = ['id', 'user', 'bar_council_number', 'experience_years', 
                  'consultation_fee', 'specialties', 'specialty_ids', 
                  'office_address', 'city', 'is_verified', 'verification_date', 'bio']
        read_only_fields = ['is_verified', 'verification_date']


class LawyerProfileListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing lawyers"""
    user = UserSerializer(read_only=True)
    specialties = LawyerSpecialtySerializer(many=True, read_only=True)
    
    class Meta:
        model = LawyerProfile
        fields = ['id', 'user', 'consultation_fee', 'specialties', 'city', 
                  'experience_years', 'is_verified']


class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'role_description', 'department']


# Case Request Serializers
class CaseRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    lawyer = UserSerializer(read_only=True)
    lawyer_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(user_type='lawyer'),
        write_only=True,
        source='lawyer'
    )
    
    class Meta:
        model = CaseRequest
        fields = ['id', 'requester', 'lawyer', 'lawyer_id', 'title', 
                  'description', 'request_date', 'status', 'response_date', 
                  'denial_reason']
        read_only_fields = ['requester', 'request_date', 'response_date']


class CaseRequestUpdateSerializer(serializers.ModelSerializer):
    """For lawyers to approve/deny requests"""
    class Meta:
        model = CaseRequest
        fields = ['status', 'denial_reason']
    
    def validate_status(self, value):
        if value not in ['approved', 'denied']:
            raise serializers.ValidationError("Status must be 'approved' or 'denied'")
        return value


# Case Serializers
class CaseSerializer(serializers.ModelSerializer):
    citizen = UserSerializer(read_only=True)
    lawyer = UserSerializer(read_only=True)
    
    class Meta:
        model = Case
        fields = ['id', 'citizen', 'lawyer', 'case_request', 'title', 
                  'description', 'case_number', 'filing_date', 'status', 
                  'court_name', 'created_at', 'updated_at']
        read_only_fields = ['citizen', 'lawyer', 'created_at', 'updated_at']


class CaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = ['title', 'description', 'case_number', 'filing_date', 
                  'court_name', 'status']


# Hearing Serializers
class HearingSerializer(serializers.ModelSerializer):
    case = CaseSerializer(read_only=True)
    
    class Meta:
        model = Hearing
        fields = ['id', 'case', 'hearing_date', 'hearing_notes', 
                  'next_hearing_date', 'outcome', 'created_at']
        read_only_fields = ['created_at']


class HearingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hearing
        fields = ['hearing_date', 'hearing_notes', 'next_hearing_date', 'outcome']


# Message Serializers
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'case', 'sender', 'content', 'attachment', 
                  'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'attachment']


# Article Serializers
class ArticleSerializer(serializers.ModelSerializer):
    specialty = LawyerSpecialtySerializer(read_only=True)
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'specialty', 'author', 
                  'created_at', 'updated_at', 'views', 'is_published']
        read_only_fields = ['author', 'created_at', 'updated_at', 'views']


class ArticleCreateSerializer(serializers.ModelSerializer):
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=LawyerSpecialty.objects.all(),
        write_only=True,
        source='specialty',
        required=False
    )
    
    class Meta:
        model = Article
        fields = ['title', 'content', 'specialty_id', 'is_published']