"""
UserFactory tests.

Covers:
  - Successful creation of each role (citizen, lawyer, admin)
  - Both User and the matching Profile are persisted
  - Specialty assignment works for lawyers
  - Unknown role raises ValueError
  - Atomicity: a failing profile creation leaves no orphaned User
"""

from unittest.mock import patch

from django.test import TestCase

from users.models import (
    User, CitizenProfile, LawyerProfile, AdminProfile, LawyerSpecialty,
)
from factories import UserFactory


# ─────────────────────────────────────────────────────────────────────────────
# Shared base data
# ─────────────────────────────────────────────────────────────────────────────

CITIZEN_DATA = dict(
    username='citizen_test',
    email='citizen@test.com',
    password='Str0ng!Pass99',
    password2='Str0ng!Pass99',   # factory ignores this via **_ignored
    first_name='Ali',
    last_name='Khan',
    phone_number='0300-1234567',
    address='House 1, Street 2',
    city='Karachi',
    cnic='citizen_test',         # test fixture — not real format
)

LAWYER_DATA = dict(
    username='lawyer_test',
    email='lawyer@test.com',
    password='Str0ng!Pass99',
    password2='Str0ng!Pass99',
    first_name='Sara',
    last_name='Ahmed',
    phone_number='0321-9876543',
    bar_council_number='BC-TEST-001',
    experience_years=7,
    consultation_fee='8000.00',
    city='Lahore',
    bio='Experienced in civil law.',
    cnic='35201-1234567-1',
    address='Flat 5, DHA',
    profile_picture=None,
    specialty_ids=[],
)

ADMIN_DATA = dict(
    username='admin_test',
    email='admin@test.com',
    password='Str0ng!Pass99',
    first_name='Ops',
    last_name='Team',
    department='Legal',
)


# ─────────────────────────────────────────────────────────────────────────────
# Citizen creation
# ─────────────────────────────────────────────────────────────────────────────

class UserFactoryCitizenTests(TestCase):
    def setUp(self):
        self.factory = UserFactory()

    def test_creates_user_with_citizen_type(self):
        user = self.factory.create('citizen', **CITIZEN_DATA)
        self.assertEqual(user.user_type, 'citizen')
        self.assertEqual(user.username, 'citizen_test')

    def test_creates_citizen_profile(self):
        user = self.factory.create('citizen', **CITIZEN_DATA)
        self.assertTrue(hasattr(user, 'citizen_profile'))
        profile = user.citizen_profile
        self.assertEqual(profile.city, 'Karachi')
        self.assertEqual(profile.cnic, 'citizen_test')

    def test_user_and_profile_both_persisted(self):
        self.factory.create('citizen', **CITIZEN_DATA)
        self.assertEqual(User.objects.filter(username='citizen_test').count(), 1)
        self.assertEqual(CitizenProfile.objects.filter(city='Karachi').count(), 1)

    def test_password_is_hashed(self):
        user = self.factory.create('citizen', **CITIZEN_DATA)
        self.assertTrue(user.check_password('Str0ng!Pass99'))
        self.assertNotEqual(user.password, 'Str0ng!Pass99')

    def test_extra_fields_like_password2_are_silently_ignored(self):
        # password2 and any other serializer artefacts must not cause an error
        data = dict(CITIZEN_DATA, password2='anything', unknown_field='x')
        user = self.factory.create('citizen', **data)
        self.assertIsNotNone(user.pk)


# ─────────────────────────────────────────────────────────────────────────────
# Lawyer creation
# ─────────────────────────────────────────────────────────────────────────────

class UserFactoryLawyerTests(TestCase):
    def setUp(self):
        self.factory = UserFactory()

    def test_creates_user_with_lawyer_type(self):
        user = self.factory.create('lawyer', **LAWYER_DATA)
        self.assertEqual(user.user_type, 'lawyer')

    def test_creates_lawyer_profile(self):
        user = self.factory.create('lawyer', **LAWYER_DATA)
        self.assertTrue(hasattr(user, 'lawyer_profile'))
        profile = user.lawyer_profile
        self.assertEqual(profile.bar_council_number, 'BC-TEST-001')
        self.assertEqual(profile.city, 'Lahore')

    def test_lawyer_starts_unverified(self):
        user = self.factory.create('lawyer', **LAWYER_DATA)
        self.assertFalse(user.lawyer_profile.is_verified)

    def test_user_and_profile_both_persisted(self):
        self.factory.create('lawyer', **LAWYER_DATA)
        self.assertEqual(User.objects.filter(username='lawyer_test').count(), 1)
        self.assertEqual(LawyerProfile.objects.filter(bar_council_number='BC-TEST-001').count(), 1)

    def test_assigns_specialties(self):
        s1 = LawyerSpecialty.objects.create(name='Criminal Law')
        s2 = LawyerSpecialty.objects.create(name='Family Law')
        data = dict(LAWYER_DATA, specialty_ids=[s1.id, s2.id])
        user = self.factory.create('lawyer', **data)
        assigned = set(user.lawyer_profile.specialties.values_list('id', flat=True))
        self.assertEqual(assigned, {s1.id, s2.id})

    def test_no_specialties_when_ids_empty(self):
        user = self.factory.create('lawyer', **LAWYER_DATA)
        self.assertEqual(user.lawyer_profile.specialties.count(), 0)

    def test_no_specialties_when_ids_omitted(self):
        data = {k: v for k, v in LAWYER_DATA.items() if k != 'specialty_ids'}
        user = self.factory.create('lawyer', **data)
        self.assertEqual(user.lawyer_profile.specialties.count(), 0)


# ─────────────────────────────────────────────────────────────────────────────
# Admin creation
# ─────────────────────────────────────────────────────────────────────────────

class UserFactoryAdminTests(TestCase):
    def setUp(self):
        self.factory = UserFactory()

    def test_creates_user_with_admin_type(self):
        user = self.factory.create('admin', **ADMIN_DATA)
        self.assertEqual(user.user_type, 'admin')

    def test_creates_admin_profile(self):
        user = self.factory.create('admin', **ADMIN_DATA)
        self.assertTrue(hasattr(user, 'admin_profile'))
        self.assertEqual(user.admin_profile.department, 'Legal')

    def test_admin_profile_gets_employee_id(self):
        user = self.factory.create('admin', **ADMIN_DATA)
        # AdminProfile.save() auto-generates employee_id
        self.assertTrue(user.admin_profile.employee_id.startswith('ADMIN'))

    def test_user_and_profile_both_persisted(self):
        self.factory.create('admin', **ADMIN_DATA)
        self.assertEqual(User.objects.filter(username='admin_test').count(), 1)
        self.assertEqual(AdminProfile.objects.filter(department='Legal').count(), 1)


# ─────────────────────────────────────────────────────────────────────────────
# Unknown role
# ─────────────────────────────────────────────────────────────────────────────

class UserFactoryInvalidRoleTests(TestCase):
    def setUp(self):
        self.factory = UserFactory()

    def test_unknown_role_raises_value_error(self):
        with self.assertRaises(ValueError):
            self.factory.create('superuser', username='x', password='y')

    def test_error_message_names_the_bad_role(self):
        with self.assertRaises(ValueError) as ctx:
            self.factory.create('wizard')
        self.assertIn('wizard', str(ctx.exception))

    def test_no_user_created_when_role_invalid(self):
        try:
            self.factory.create('ghost', username='ghost_user', password='pw')
        except ValueError:
            pass
        self.assertEqual(User.objects.filter(username='ghost_user').count(), 0)


# ─────────────────────────────────────────────────────────────────────────────
# Atomicity
# ─────────────────────────────────────────────────────────────────────────────

class UserFactoryAtomicityTests(TestCase):
    """
    Verify that if profile creation fails mid-way, the transaction rolls back
    and leaves no orphaned User row.
    """

    def setUp(self):
        self.factory = UserFactory()

    def test_citizen_user_rolled_back_when_profile_creation_fails(self):
        with patch.object(CitizenProfile.objects, 'create', side_effect=Exception('DB error')):
            with self.assertRaises(Exception):
                self.factory.create('citizen', **CITIZEN_DATA)

        self.assertEqual(User.objects.filter(username='citizen_test').count(), 0)

    def test_lawyer_user_rolled_back_when_profile_creation_fails(self):
        with patch.object(LawyerProfile.objects, 'create', side_effect=Exception('DB error')):
            with self.assertRaises(Exception):
                self.factory.create('lawyer', **LAWYER_DATA)

        self.assertEqual(User.objects.filter(username='lawyer_test').count(), 0)

    def test_admin_user_rolled_back_when_profile_creation_fails(self):
        with patch.object(AdminProfile.objects, 'create', side_effect=Exception('DB error')):
            with self.assertRaises(Exception):
                self.factory.create('admin', **ADMIN_DATA)

        self.assertEqual(User.objects.filter(username='admin_test').count(), 0)

    def test_successful_creation_is_committed(self):
        # Sanity-check that non-failing paths DO persist
        user = self.factory.create('citizen', **CITIZEN_DATA)
        self.assertIsNotNone(user.pk)
        self.assertTrue(User.objects.filter(pk=user.pk).exists())
        self.assertTrue(CitizenProfile.objects.filter(user=user).exists())
