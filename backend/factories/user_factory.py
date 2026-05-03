from django.db import transaction
from django.contrib.auth import get_user_model

from users.models import CitizenProfile, LawyerProfile, AdminProfile, LawyerSpecialty

User = get_user_model()

# User fields that belong on the User model, not on any profile.
_USER_FIELDS = {'username', 'email', 'password', 'first_name', 'last_name', 'phone_number'}


class UserFactory:
    """
    Factory that creates a User together with its role-specific Profile in a
    single atomic transaction.  Callers pass already-validated data; the factory
    does not re-validate.

    Usage:
        factory = UserFactory()
        user = factory.create('citizen', username='ali', password='...', cnic='...')
        user = factory.create('lawyer', username='sara', bar_council_number='...', ...)
        user = factory.create('admin',  username='ops',  department='Legal')
    """

    def create(self, role: str, **data) -> User:
        """
        Dispatch to the appropriate private creator method.

        Raises ValueError for an unrecognised role so callers get a clear error
        instead of a silent no-op.
        """
        creators = {
            'citizen': self._create_citizen,
            'lawyer':  self._create_lawyer,
            'admin':   self._create_admin,
        }

        creator = creators.get(role)
        if creator is None:
            valid = ', '.join(f"'{r}'" for r in creators)
            raise ValueError(f"Unknown role '{role}'. Must be one of: {valid}.")

        return creator(**data)

    # ── Private creators ─────────────────────────────────────────────────────

    @transaction.atomic
    def _create_citizen(
        self,
        username: str,
        email: str,
        password: str,
        first_name: str = '',
        last_name: str = '',
        phone_number: str = '',
        address: str = '',
        city: str = '',
        cnic: str = '',
        **_ignored,          # absorbs password2 and any other serializer extras
    ) -> User:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            user_type='citizen',
        )
        CitizenProfile.objects.create(
            user=user,
            address=address,
            city=city,
            cnic=cnic,
        )
        return user

    @transaction.atomic
    def _create_lawyer(
        self,
        username: str,
        email: str,
        password: str,
        first_name: str = '',
        last_name: str = '',
        phone_number: str = '',
        bar_council_number: str = '',
        experience_years: int = 0,
        consultation_fee=None,
        city: str = '',
        bio: str = '',
        cnic: str = '',
        address: str = '',
        profile_picture=None,
        specialty_ids: list = None,
        **_ignored,
    ) -> User:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            user_type='lawyer',
        )
        lawyer_profile = LawyerProfile.objects.create(
            user=user,
            bar_council_number=bar_council_number,
            experience_years=experience_years,
            consultation_fee=consultation_fee or '0.00',
            city=city,
            bio=bio,
            cnic=cnic,
            address=address,
            profile_picture=profile_picture,
            is_verified=False,
        )
        if specialty_ids:
            specialties = LawyerSpecialty.objects.filter(id__in=specialty_ids)
            lawyer_profile.specialties.set(specialties)

        return user

    @transaction.atomic
    def _create_admin(
        self,
        username: str,
        email: str,
        password: str,
        first_name: str = '',
        last_name: str = '',
        phone_number: str = '',
        department: str = 'General',
        **_ignored,
    ) -> User:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            user_type='admin',
        )
        AdminProfile.objects.create(user=user, department=department)
        return user
