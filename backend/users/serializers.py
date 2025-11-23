from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, CitizenProfile, LawyerProfile, AdminProfile, LawyerSpecialty

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'first_name', 'last_name', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user info with profile"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'first_name', 'last_name', 'phone_number', 'profile']
    
    def get_profile(self, obj):
        if obj.user_type == 'citizen' and hasattr(obj, 'citizen_profile'):
            return CitizenProfileSerializer(obj.citizen_profile).data
        elif obj.user_type == 'lawyer' and hasattr(obj, 'lawyer_profile'):
            return LawyerProfileSerializer(obj.lawyer_profile).data
        elif obj.user_type == 'admin' and hasattr(obj, 'admin_profile'):
            return AdminProfileSerializer(obj.admin_profile).data
        return None

# Registration Serializers
class CitizenRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Profile fields
    address = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    cnic = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 
                  'phone_number', 'address', 'city', 'cnic']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        # Extract profile data
        address = validated_data.pop('address')
        city = validated_data.pop('city')
        cnic = validated_data.pop('cnic')
        validated_data.pop('password2')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            user_type='citizen'
        )
        
        # Create citizen profile
        CitizenProfile.objects.create(
            user=user,
            address=address,
            city=city,
            cnic=cnic
        )
        
        return user

class LawyerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    # Profile fields
    bar_council_number = serializers.CharField(required=True)
    experience_years = serializers.IntegerField(required=True)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    city = serializers.CharField(required=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    specialty_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        write_only=True, 
        required=False
    )
    
    # NEW FIELDS
    cnic = serializers.CharField(required=True, help_text="XXXXX-XXXXXXX-X")
    address = serializers.CharField(required=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2', 'first_name', 'last_name',
            'phone_number', 'bar_council_number', 'experience_years', 'consultation_fee',
            'city', 'bio', 'specialty_ids', 'cnic', 'address', 'profile_picture'
        ]
    
    def validate_cnic(self, value):
        """Validate CNIC format"""
        import re
        if not re.match(r'^\d{5}-\d{7}-\d$', value):
            raise serializers.ValidationError("CNIC must be in format: XXXXX-XXXXXXX-X")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if CNIC already exists
        if LawyerProfile.objects.filter(cnic=attrs.get('cnic')).exists():
            raise serializers.ValidationError({"cnic": "A lawyer with this CNIC already exists."})
        
        return attrs
    
    def create(self, validated_data):
        # Extract profile data
        bar_council_number = validated_data.pop('bar_council_number')
        experience_years = validated_data.pop('experience_years')
        consultation_fee = validated_data.pop('consultation_fee')
        city = validated_data.pop('city')
        bio = validated_data.pop('bio', '')
        specialty_ids = validated_data.pop('specialty_ids', [])
        cnic = validated_data.pop('cnic')
        address = validated_data.pop('address')
        profile_picture = validated_data.pop('profile_picture', None)
        validated_data.pop('password2')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', ''),
            user_type='lawyer'
        )
        
        # Create lawyer profile
        lawyer_profile = LawyerProfile.objects.create(
            user=user,
            bar_council_number=bar_council_number,
            experience_years=experience_years,
            consultation_fee=consultation_fee,
            city=city,
            bio=bio,
            cnic=cnic,
            address=address,
            profile_picture=profile_picture,
            is_verified=False  # Needs admin verification
        )
        
        # Add specialties
        if specialty_ids:
            specialties = LawyerSpecialty.objects.filter(id__in=specialty_ids)
            lawyer_profile.specialties.set(specialties)
        
        return user

# Custom JWT Token Serializer
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom claims
        data['user_type'] = self.user.user_type
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        
        return data

# Profile Serializers
class CitizenProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CitizenProfile
        fields = '__all__'

class LawyerSpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = LawyerSpecialty
        fields = '__all__'

class LawyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialties = LawyerSpecialtySerializer(many=True, read_only=True)
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LawyerProfile
        fields = '__all__'
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

class AdminProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminProfile
        fields = '__all__'