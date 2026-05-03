from django.utils import timezone
from django.contrib.auth import get_user_model

from users.models import LawyerProfile

User = get_user_model()


class UserRepository:
    def get_by_id(self, user_id):
        """Return a User by primary key, or None."""
        return User.objects.filter(id=user_id).first()

    def get_lawyers_by_city(self, city=None, specialty_id=None):
        """
        Return verified LawyerProfiles, optionally filtered by city (case-insensitive
        substring) and/or specialty FK id.
        """
        qs = LawyerProfile.objects.filter(is_verified=True)

        if city:
            qs = qs.filter(city__icontains=city)

        if specialty_id:
            qs = qs.filter(specialties__id=specialty_id)

        return qs.select_related('user').prefetch_related('specialties').order_by('-id')

    def get_unverified_lawyers(self):
        """Return all LawyerProfiles awaiting verification, newest first."""
        return (
            LawyerProfile.objects
            .filter(is_verified=False)
            .select_related('user')
            .prefetch_related('specialties')
            .order_by('-id')
        )

    def get_lawyer_stats_by_city(self):
        """
        Return a dict of verified-lawyer counts: total and per named city
        (Karachi, Lahore, Islamabad).
        """
        verified = LawyerProfile.objects.filter(is_verified=True)
        return {
            'total_verified': verified.count(),
            'karachi_lawyers': verified.filter(city='Karachi').count(),
            'lahore_lawyers': verified.filter(city='Lahore').count(),
            'islamabad_lawyers': verified.filter(city='Islamabad').count(),
        }

    def verify_lawyer(self, lawyer, verified_by_user):
        """Mark a LawyerProfile as verified and record who did it."""
        lawyer.is_verified = True
        lawyer.verification_date = timezone.now()
        lawyer.verified_by = verified_by_user
        lawyer.save(update_fields=['is_verified', 'verification_date', 'verified_by'])
        return lawyer

    def get_lawyer_by_id(self, lawyer_id):
        """Return a LawyerProfile by pk, or None."""
        return LawyerProfile.objects.filter(id=lawyer_id).first()

    def delete_lawyer_account(self, lawyer):
        """Hard-delete the User account behind a LawyerProfile (cascades to profile)."""
        lawyer.user.delete()
