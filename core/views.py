from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    User, CitizenProfile, LawyerProfile, AdminProfile,
    LawyerSpecialty, CaseRequest, Case, Hearing, Message, Article
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    CitizenProfileSerializer, LawyerProfileSerializer, LawyerProfileListSerializer,
    AdminProfileSerializer, LawyerSpecialtySerializer,
    CaseRequestSerializer, CaseRequestUpdateSerializer,
    CaseSerializer, CaseCreateSerializer,
    HearingSerializer, HearingCreateSerializer,
    MessageSerializer, MessageCreateSerializer,
    ArticleSerializer, ArticleCreateSerializer
)


# User Registration View
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully. Please complete your profile.'
        }, status=status.HTTP_201_CREATED)


# Current User View
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# Lawyer Specialty ViewSet
class LawyerSpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LawyerSpecialty.objects.all()
    serializer_class = LawyerSpecialtySerializer
    permission_classes = [AllowAny]


# Citizen Profile ViewSet
class CitizenProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CitizenProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'citizen':
            return CitizenProfile.objects.filter(user=self.request.user)
        return CitizenProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Lawyer Profile ViewSet
class LawyerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = LawyerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'lawyer':
            return LawyerProfile.objects.filter(user=self.request.user)
        elif self.request.user.user_type == 'admin':
            return LawyerProfile.objects.all()
        return LawyerProfile.objects.filter(is_verified=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Admin action to verify a lawyer"""
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can verify lawyers'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        lawyer_profile = self.get_object()
        lawyer_profile.is_verified = True
        lawyer_profile.verification_date = timezone.now()
        lawyer_profile.save()
        
        return Response({'message': 'Lawyer verified successfully'})


# Verified Lawyers List (for citizens to search)
class VerifiedLawyersListView(generics.ListAPIView):
    serializer_class = LawyerProfileListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = LawyerProfile.objects.filter(is_verified=True)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by specialty
        specialty_id = self.request.query_params.get('specialty', None)
        if specialty_id:
            queryset = queryset.filter(specialties__id=specialty_id)
        
        return queryset


# Case Request ViewSet
class CaseRequestViewSet(viewsets.ModelViewSet):
    serializer_class = CaseRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'citizen':
            return CaseRequest.objects.filter(requester=user)
        elif user.user_type == 'lawyer':
            return CaseRequest.objects.filter(lawyer=user)
        return CaseRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def respond(self, request, pk=None):
        """Lawyer responds to case request"""
        if request.user.user_type != 'lawyer':
            return Response({'error': 'Only lawyers can respond to requests'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        case_request = self.get_object()
        if case_request.lawyer != request.user:
            return Response({'error': 'Not your request'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = CaseRequestUpdateSerializer(case_request, data=request.data)
        if serializer.is_valid():
            serializer.save(response_date=timezone.now())
            
            # If approved, create a case
            if serializer.validated_data['status'] == 'approved':
                Case.objects.create(
                    citizen=case_request.requester,
                    lawyer=request.user,
                    case_request=case_request,
                    title=case_request.title,
                    description=case_request.description,
                    case_number=f"CASE-{timezone.now().strftime('%Y%m%d')}-{case_request.id}",
                    filing_date=timezone.now().date()
                )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Case ViewSet
class CaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return CaseCreateSerializer
        return CaseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'citizen':
            return Case.objects.filter(citizen=user)
        elif user.user_type == 'lawyer':
            return Case.objects.filter(lawyer=user)
        return Case.objects.none()


# Hearing ViewSet
class HearingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return HearingCreateSerializer
        return HearingSerializer

    def get_queryset(self):
        user = self.request.user
        case_id = self.request.query_params.get('case', None)
        
        if user.user_type == 'citizen':
            queryset = Hearing.objects.filter(case__citizen=user)
        elif user.user_type == 'lawyer':
            queryset = Hearing.objects.filter(case__lawyer=user)
        else:
            queryset = Hearing.objects.none()
        
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        return queryset

    def perform_create(self, serializer):
        case_id = self.request.data.get('case_id')
        case = get_object_or_404(Case, id=case_id)
        
        # Check permission
        if self.request.user not in [case.citizen, case.lawyer]:
            return Response({'error': 'Not authorized'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer.save(case=case)


# Message ViewSet
class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def get_queryset(self):
        user = self.request.user
        case_id = self.request.query_params.get('case', None)
        
        if user.user_type == 'citizen':
            queryset = Message.objects.filter(case__citizen=user)
        elif user.user_type == 'lawyer':
            queryset = Message.objects.filter(case__lawyer=user)
        else:
            queryset = Message.objects.none()
        
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        return queryset

    def perform_create(self, serializer):
        case_id = self.request.data.get('case_id')
        case = get_object_or_404(Case, id=case_id)
        
        # Check permission
        if self.request.user not in [case.citizen, case.lawyer]:
            return Response({'error': 'Not authorized'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer.save(sender=self.request.user, case=case)


# Article ViewSet
class ArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateSerializer
        return ArticleSerializer

    def get_queryset(self):
        queryset = Article.objects.filter(is_published=True)
        
        # Filter by specialty
        specialty_id = self.request.query_params.get('specialty', None)
        if specialty_id:
            queryset = queryset.filter(specialty_id=specialty_id)
        
        # Search by title or content
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(content__icontains=search)
        
        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)