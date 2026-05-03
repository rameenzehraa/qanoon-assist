from rest_framework import viewsets, status, generics, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .models import LawyerProfile, LawyerSpecialty
from .serializers import (
    LawyerProfileSerializer, LawyerSpecialtySerializer,
    CitizenRegistrationSerializer, LawyerRegistrationSerializer,
    CustomTokenObtainPairSerializer, UserDetailSerializer
)
from repositories import UserRepository
from factories import UserFactory

User = get_user_model()
user_repo = UserRepository()
user_factory = UserFactory()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CitizenRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CitizenRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = user_factory.create('citizen', **serializer.validated_data)
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
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = user_factory.create('lawyer', **serializer.validated_data)
        return Response({
            'message': 'Lawyer registered successfully! Your account is pending admin verification. You will be notified once verified.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'user_type': user.user_type,
                'is_verified': False
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserDetailSerializer(request.user)
    return Response(serializer.data)


class LawyerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LawyerProfile.objects.filter(is_verified=True)
    serializer_class = LawyerProfileSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        city = self.request.query_params.get('city')
        specialty_id = self.request.query_params.get('specialty')
        return user_repo.get_lawyers_by_city(city=city, specialty_id=specialty_id)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def unverified(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        unverified = user_repo.get_unverified_lawyers()
        serializer = self.get_serializer(unverified, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can verify lawyers'}, status=status.HTTP_403_FORBIDDEN)

        lawyer = user_repo.get_lawyer_by_id(pk)
        if not lawyer:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)

        lawyer = user_repo.verify_lawyer(lawyer, verified_by_user=request.user)
        return Response({
            'message': f'Lawyer {lawyer.user.get_full_name()} verified successfully',
            'lawyer': self.get_serializer(lawyer).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can reject lawyers'}, status=status.HTTP_403_FORBIDDEN)

        lawyer = user_repo.get_lawyer_by_id(pk)
        if not lawyer:
            return Response({'error': 'Lawyer not found'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', 'Not specified')
        user_repo.delete_lawyer_account(lawyer)
        return Response({'message': f'Lawyer rejected. Reason: {reason}'})

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def stats(self, request):
        return Response(user_repo.get_lawyer_stats_by_city())


class LawyerSpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LawyerSpecialty.objects.all()
    serializer_class = LawyerSpecialtySerializer
    permission_classes = [AllowAny]
