"""
Repository layer tests.

Each repository class gets:
  - setUp() that creates minimal but realistic fixtures
  - At least one positive-path test
  - At least one edge-case / negative-path test

Run with:
  python manage.py test tests.test_repositories
"""

from django.test import TestCase
from django.utils import timezone

from users.models import User, CitizenProfile, LawyerProfile, LawyerSpecialty
from cases.models import CaseRequest, Case, Hearing, CaseUpdate
from messaging.models import Message
from repositories import UserRepository, CaseRepository, MessageRepository


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_user(username, user_type, **kwargs):
    return User.objects.create_user(
        username=username,
        password='testpass123',
        user_type=user_type,
        email=f'{username}@test.com',
        **kwargs,
    )


def make_citizen(username):
    user = make_user(username, 'citizen')
    # Use full username as CNIC (unique per user; max_length=15 is fine for test names)
    profile = CitizenProfile.objects.create(user=user, cnic=username[:15])
    return user, profile


def make_lawyer(username, city='Karachi', verified=True):
    user = make_user(username, 'lawyer')
    profile = LawyerProfile.objects.create(
        user=user,
        bar_council_number=f'BC-{username}',
        experience_years=5,
        consultation_fee='5000.00',
        is_verified=verified,
        city=city,
    )
    return user, profile


def make_case_request(citizen_profile, lawyer_profile, title='Test Case', status='pending'):
    return CaseRequest.objects.create(
        requester=citizen_profile,
        lawyer=lawyer_profile,
        case_title=title,
        case_type='Civil',
        description='Test description',
        urgency='medium',
        status=status,
    )


# ─────────────────────────────────────────────────────────────────────────────
# UserRepository
# ─────────────────────────────────────────────────────────────────────────────

class UserRepositoryTests(TestCase):
    def setUp(self):
        self.repo = UserRepository()
        self.admin_user = make_user('admin1', 'admin')

        _, self.lawyer_karachi = make_lawyer('lawyer_khi', city='Karachi', verified=True)
        _, self.lawyer_lahore = make_lawyer('lawyer_lhe', city='Lahore', verified=True)
        _, self.unverified = make_lawyer('lawyer_unverified', city='Islamabad', verified=False)

        self.specialty = LawyerSpecialty.objects.create(name='Criminal Law')
        self.lawyer_karachi.specialties.add(self.specialty)

    # ── get_by_id ────────────────────────────────────────────────────────────

    def test_get_by_id_returns_correct_user(self):
        result = self.repo.get_by_id(self.admin_user.id)
        self.assertEqual(result, self.admin_user)

    def test_get_by_id_nonexistent_returns_none(self):
        result = self.repo.get_by_id(999999)
        self.assertIsNone(result)

    # ── get_lawyers_by_city ──────────────────────────────────────────────────

    def test_get_lawyers_by_city_filters_correctly(self):
        result = self.repo.get_lawyers_by_city(city='Karachi')
        self.assertIn(self.lawyer_karachi, result)
        self.assertNotIn(self.lawyer_lahore, result)

    def test_get_lawyers_by_city_case_insensitive(self):
        result = self.repo.get_lawyers_by_city(city='karachi')
        self.assertIn(self.lawyer_karachi, result)

    def test_get_lawyers_by_city_excludes_unverified(self):
        result = self.repo.get_lawyers_by_city(city='Islamabad')
        self.assertNotIn(self.unverified, result)

    def test_get_lawyers_by_city_no_filter_returns_all_verified(self):
        result = self.repo.get_lawyers_by_city()
        ids = list(result.values_list('id', flat=True))
        self.assertIn(self.lawyer_karachi.id, ids)
        self.assertIn(self.lawyer_lahore.id, ids)
        self.assertNotIn(self.unverified.id, ids)

    def test_get_lawyers_by_city_with_specialty_filter(self):
        result = self.repo.get_lawyers_by_city(specialty_id=self.specialty.id)
        self.assertIn(self.lawyer_karachi, result)
        self.assertNotIn(self.lawyer_lahore, result)

    # ── get_unverified_lawyers ───────────────────────────────────────────────

    def test_get_unverified_lawyers_returns_only_unverified(self):
        result = self.repo.get_unverified_lawyers()
        self.assertIn(self.unverified, result)
        self.assertNotIn(self.lawyer_karachi, result)

    def test_get_unverified_lawyers_empty_when_all_verified(self):
        self.unverified.is_verified = True
        self.unverified.save()
        result = self.repo.get_unverified_lawyers()
        self.assertEqual(result.count(), 0)

    # ── get_lawyer_stats_by_city ─────────────────────────────────────────────

    def test_get_lawyer_stats_by_city_counts_correctly(self):
        stats = self.repo.get_lawyer_stats_by_city()
        self.assertEqual(stats['total_verified'], 2)
        self.assertEqual(stats['karachi_lawyers'], 1)
        self.assertEqual(stats['lahore_lawyers'], 1)
        self.assertEqual(stats['islamabad_lawyers'], 0)

    def test_get_lawyer_stats_zeros_when_no_verified(self):
        LawyerProfile.objects.update(is_verified=False)
        stats = self.repo.get_lawyer_stats_by_city()
        self.assertEqual(stats['total_verified'], 0)

    # ── verify_lawyer ────────────────────────────────────────────────────────

    def test_verify_lawyer_sets_fields(self):
        before = timezone.now()
        result = self.repo.verify_lawyer(self.unverified, verified_by_user=self.admin_user)
        self.assertTrue(result.is_verified)
        self.assertEqual(result.verified_by, self.admin_user)
        self.assertGreaterEqual(result.verification_date, before)

    # ── get_lawyer_by_id ─────────────────────────────────────────────────────

    def test_get_lawyer_by_id_returns_correct_profile(self):
        result = self.repo.get_lawyer_by_id(self.lawyer_karachi.id)
        self.assertEqual(result, self.lawyer_karachi)

    def test_get_lawyer_by_id_nonexistent_returns_none(self):
        result = self.repo.get_lawyer_by_id(999999)
        self.assertIsNone(result)


# ─────────────────────────────────────────────────────────────────────────────
# CaseRepository
# ─────────────────────────────────────────────────────────────────────────────

class CaseRepositoryTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()

        _, self.citizen = make_citizen('citizen1')
        _, self.citizen2 = make_citizen('citizen2')
        _, self.lawyer = make_lawyer('lawyer1')
        _, self.lawyer2 = make_lawyer('lawyer2')

        self.req1 = make_case_request(self.citizen, self.lawyer, title='Case A')
        self.req2 = make_case_request(self.citizen2, self.lawyer, title='Case B')

    # ── get_requests_for_citizen ─────────────────────────────────────────────

    def test_get_requests_for_citizen_returns_only_own(self):
        result = self.repo.get_requests_for_citizen(self.citizen)
        self.assertIn(self.req1, result)
        self.assertNotIn(self.req2, result)

    def test_get_requests_for_citizen_empty_for_new_citizen(self):
        _, new_citizen = make_citizen('newcitizen')
        result = self.repo.get_requests_for_citizen(new_citizen)
        self.assertEqual(result.count(), 0)

    # ── get_requests_for_lawyer ──────────────────────────────────────────────

    def test_get_requests_for_lawyer_returns_only_assigned(self):
        result = self.repo.get_requests_for_lawyer(self.lawyer)
        self.assertIn(self.req1, result)
        self.assertIn(self.req2, result)

    def test_get_requests_for_lawyer_empty_for_unassigned_lawyer(self):
        result = self.repo.get_requests_for_lawyer(self.lawyer2)
        self.assertEqual(result.count(), 0)

    # ── accept_request ───────────────────────────────────────────────────────

    def test_accept_request_sets_status_and_date(self):
        before = timezone.now()
        result = self.repo.accept_request(self.req1, message='Accepted!')
        self.assertEqual(result.status, 'accepted')
        self.assertEqual(result.response_message, 'Accepted!')
        self.assertGreaterEqual(result.response_date, before)

    def test_reject_request_sets_status_and_date(self):
        before = timezone.now()
        result = self.repo.reject_request(self.req1, message='Sorry, cannot take.')
        self.assertEqual(result.status, 'rejected')
        self.assertGreaterEqual(result.response_date, before)

    # ── create_case_from_request ─────────────────────────────────────────────

    def test_create_case_from_request_creates_case(self):
        case = self.repo.create_case_from_request(self.req1)
        self.assertIsNotNone(case.id)
        self.assertEqual(case.title, self.req1.case_title)
        self.assertEqual(case.citizen, self.citizen)
        self.assertEqual(case.lawyer, self.lawyer)

    def test_create_case_from_request_idempotent(self):
        case1 = self.repo.create_case_from_request(self.req1)
        case2 = self.repo.create_case_from_request(self.req1)
        self.assertEqual(case1.id, case2.id)
        self.assertEqual(Case.objects.filter(case_request=self.req1).count(), 1)

    # ── get_request_stats ────────────────────────────────────────────────────

    def test_get_request_stats_for_lawyer(self):
        make_case_request(self.citizen, self.lawyer, title='Case C', status='accepted')
        stats = self.repo.get_request_stats(self.lawyer, role='lawyer')
        self.assertEqual(stats['total_requests'], 3)  # req1 + req2 + Case C
        self.assertEqual(stats['accepted'], 1)

    def test_get_request_stats_empty_lawyer(self):
        stats = self.repo.get_request_stats(self.lawyer2, role='lawyer')
        self.assertEqual(stats['total_requests'], 0)

    # ── mark_viewed ──────────────────────────────────────────────────────────

    def test_mark_viewed_updates_timestamp(self):
        before = timezone.now()
        result = self.repo.mark_viewed(self.req1)
        self.assertGreaterEqual(result.last_viewed_at, before)

    # ── has_new_updates ──────────────────────────────────────────────────────

    def test_has_new_updates_false_when_no_case(self):
        result = self.repo.has_new_updates(self.req1, since=None)
        self.assertFalse(result)

    def test_has_new_updates_true_when_hearing_exists_and_since_is_none(self):
        case = self.repo.create_case_from_request(self.req1)
        Hearing.objects.create(
            case=case,
            title='Hearing',
            hearing_date=timezone.now(),
            location='Court A',
        )
        result = self.repo.has_new_updates(self.req1, since=None)
        self.assertTrue(result)

    def test_has_new_updates_true_after_hearing_created(self):
        past = timezone.now() - timezone.timedelta(hours=1)
        case = self.repo.create_case_from_request(self.req1)
        Hearing.objects.create(
            case=case,
            title='Hearing',
            hearing_date=timezone.now(),
            location='Court A',
        )
        result = self.repo.has_new_updates(self.req1, since=past)
        self.assertTrue(result)

    def test_has_new_updates_false_when_no_activity_since_view(self):
        case = self.repo.create_case_from_request(self.req1)
        Hearing.objects.create(
            case=case,
            title='Old hearing',
            hearing_date=timezone.now(),
            location='Court A',
        )
        # Place the "viewed_at" 1 hour in the future — hearing was created before it
        future_viewed_at = timezone.now() + timezone.timedelta(hours=1)
        result = self.repo.has_new_updates(self.req1, since=future_viewed_at)
        self.assertFalse(result)

    # ── get_cases_for_citizen / lawyer ───────────────────────────────────────

    def test_get_cases_for_citizen_returns_own_cases(self):
        case = self.repo.create_case_from_request(self.req1)
        result = self.repo.get_cases_for_citizen(self.citizen)
        self.assertIn(case, result)

    def test_get_cases_for_citizen_excludes_others(self):
        case = self.repo.create_case_from_request(self.req1)
        result = self.repo.get_cases_for_citizen(self.citizen2)
        self.assertNotIn(case, result)


# ─────────────────────────────────────────────────────────────────────────────
# MessageRepository
# ─────────────────────────────────────────────────────────────────────────────

class MessageRepositoryTests(TestCase):
    def setUp(self):
        self.repo = MessageRepository()

        self.citizen_user, self.citizen = make_citizen('msgcitizen')
        self.lawyer_user, self.lawyer = make_lawyer('msglawyer')

        self.case_request = make_case_request(self.citizen, self.lawyer)

        # Two messages: one from each party
        self.msg_from_citizen = Message.objects.create(
            case_request=self.case_request,
            sender=self.citizen_user,
            content='Hello lawyer',
            is_read=False,
        )
        self.msg_from_lawyer = Message.objects.create(
            case_request=self.case_request,
            sender=self.lawyer_user,
            content='Hello citizen',
            is_read=False,
        )

    # ── get_messages_for_case ────────────────────────────────────────────────

    def test_get_messages_for_case_returns_all_in_thread(self):
        result = self.repo.get_messages_for_case(self.case_request)
        ids = list(result.values_list('id', flat=True))
        self.assertIn(self.msg_from_citizen.id, ids)
        self.assertIn(self.msg_from_lawyer.id, ids)

    def test_get_messages_for_case_ordered_by_timestamp(self):
        result = list(self.repo.get_messages_for_case(self.case_request))
        self.assertLessEqual(result[0].timestamp, result[-1].timestamp)

    def test_get_messages_for_case_empty_thread(self):
        _, citizen2 = make_citizen('emtcitizen')
        _, lawyer2 = make_lawyer('emtlawyer')
        other_req = make_case_request(citizen2, lawyer2, title='Empty')
        result = self.repo.get_messages_for_case(other_req)
        self.assertEqual(result.count(), 0)

    # ── mark_as_read ─────────────────────────────────────────────────────────

    def test_mark_as_read_marks_others_messages(self):
        # Citizen reads — should mark lawyer's message as read
        updated = self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        self.assertEqual(updated, 1)
        self.msg_from_lawyer.refresh_from_db()
        self.assertTrue(self.msg_from_lawyer.is_read)

    def test_mark_as_read_does_not_mark_own_messages(self):
        self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        self.msg_from_citizen.refresh_from_db()
        self.assertFalse(self.msg_from_citizen.is_read)

    def test_mark_as_read_idempotent(self):
        self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        updated_again = self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        self.assertEqual(updated_again, 0)

    # ── get_unread_count ──────────────────────────────────────────────────────

    def test_get_unread_count_for_citizen(self):
        count = self.repo.get_unread_count(self.citizen_user)
        self.assertEqual(count, 1)  # only lawyer's message is unread

    def test_get_unread_count_after_reading(self):
        self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        count = self.repo.get_unread_count(self.citizen_user)
        self.assertEqual(count, 0)

    def test_get_unread_count_for_admin_returns_zero(self):
        admin = make_user('admin99', 'admin')
        count = self.repo.get_unread_count(admin)
        self.assertEqual(count, 0)

    # ── get_stats_for_user ────────────────────────────────────────────────────

    def test_get_stats_for_citizen(self):
        stats = self.repo.get_stats_for_user(self.citizen_user)
        self.assertEqual(stats['total_messages'], 2)
        self.assertEqual(stats['sent'], 1)
        self.assertEqual(stats['received'], 1)
        self.assertEqual(stats['unread'], 1)

    def test_get_stats_for_admin_returns_zeros(self):
        admin = make_user('admin88', 'admin')
        stats = self.repo.get_stats_for_user(admin)
        self.assertEqual(stats['total_messages'], 0)

    def test_get_stats_after_reading(self):
        self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        stats = self.repo.get_stats_for_user(self.citizen_user)
        self.assertEqual(stats['unread'], 0)

    # ── get_unread_count_for_case ─────────────────────────────────────────────

    def test_get_unread_count_for_case_citizen(self):
        count = self.repo.get_unread_count_for_case(self.case_request, self.citizen_user)
        self.assertEqual(count, 1)

    def test_get_unread_count_for_case_zero_after_read(self):
        self.repo.mark_as_read(self.case_request, reader=self.citizen_user)
        count = self.repo.get_unread_count_for_case(self.case_request, self.citizen_user)
        self.assertEqual(count, 0)
