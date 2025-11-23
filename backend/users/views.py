from rest_framework import viewsets, status, generics, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import LawyerProfile, LawyerSpecialty, CitizenProfile
from .serializers import (
    LawyerProfileSerializer, LawyerSpecialtySerializer,
    CitizenRegistrationSerializer, LawyerRegistrationSerializer,
    CustomTokenObtainPairSerializer, UserDetailSerializer
)

User = get_user_model()

# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CitizenRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CitizenRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Citizen registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type
            }
        }, status=status.HTTP_201_CREATED)

class LawyerRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = LawyerRegistrationSerializer
    permission_classes = [AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]  # Handle file upload
    
    def create(self, request, *args, **kwargs):
        print("Received data:", request.data)  # DEBUG
        print("Files:", request.FILES)  # DEBUG
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Lawyer registered successfully! Your account is pending admin verification. You will be notified once verified.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'is_verified': False  # Show verification status
            }
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Make sure this is set
def get_current_user(request):
    """Get current logged-in user details"""
    print(f"Request user: {request.user}")  # DEBUG
    print(f"Is authenticated: {request.user.is_authenticated}")  # DEBUG
    print(f"Auth header: {request.META.get('HTTP_AUTHORIZATION')}")  # DEBUG
    
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)

# Lawyer Views
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import LawyerProfile, LawyerSpecialty, CitizenProfile
from .serializers import (
    LawyerProfileSerializer, LawyerSpecialtySerializer,
    CitizenRegistrationSerializer, LawyerRegistrationSerializer,
    CustomTokenObtainPairSerializer, UserDetailSerializer
)

User = get_user_model()

class LawyerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LawyerProfile.objects.filter(is_verified=True)
    serializer_class = LawyerProfileSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by specialty
        specialty_id = self.request.query_params.get('specialty', None)
        if specialty_id:
            queryset = queryset.filter(specialties__id=specialty_id)
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def unverified(self, request):
        """Admin endpoint to get unverified lawyers"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        unverified = LawyerProfile.objects.filter(is_verified=False)
        serializer = self.get_serializer(unverified, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Admin endpoint to verify a lawyer"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can verify lawyers'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            lawyer = LawyerProfile.objects.get(id=pk)
        except LawyerProfile.DoesNotExist:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        lawyer.is_verified = True
        lawyer.verification_date = timezone.now()
        lawyer.verified_by = request.user
        lawyer.save()
        
        return Response({
            'message': f'Lawyer {lawyer.user.get_full_name()} verified successfully',
            'lawyer': self.get_serializer(lawyer).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Admin endpoint to reject/unverify a lawyer"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can reject lawyers'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            lawyer = LawyerProfile.objects.get(id=pk)
        except LawyerProfile.DoesNotExist:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)
        
        reason = request.data.get('reason', 'Not specified')
        
        # Option 1: Delete the account
        # user = lawyer.user
        # user.delete()
        
        # Option 2: Just mark as unverified (we'll use this)
        lawyer.is_verified = False
        lawyer.save()
        
        return Response({
            'message': f'Lawyer rejected. Reason: {reason}'
        })

class LawyerSpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LawyerSpecialty.objects.all()
    serializer_class = LawyerSpecialtySerializer
    permission_classes = [AllowAny]