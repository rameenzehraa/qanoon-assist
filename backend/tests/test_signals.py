"""
Observer Pattern (Django signals) tests.

Covers:
  - case_status_changed fires on accept, reject, mark_in_progress, mark_complete
  - case_assigned fires on create_case_from_request (new case only, not idempotent second call)
  - case_closed fires on mark_complete (in addition to case_status_changed)
  - NotificationObserver creates the correct Notification row for each event
  - AuditLogObserver creates the correct CaseAuditLog row for each event
  - performed_by is stored in CaseAuditLog

Run with:
  python manage.py test tests.test_signals
"""

from django.test import TestCase

from users.models import User, CitizenProfile, LawyerProfile
from cases.models import CaseRequest, Notification, CaseAuditLog
from repositories import CaseRepository


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_user(username, user_type):
    return User.objects.create_user(
        username=username,
        password='testpass123',
        user_type=user_type,
        email=f'{username}@test.com',
    )


def make_citizen(username):
    user = make_user(username, 'citizen')
    profile = CitizenProfile.objects.create(user=user, cnic=username[:15])
    return user, profile


def make_lawyer(username):
    user = make_user(username, 'lawyer')
    profile = LawyerProfile.objects.create(
        user=user,
        bar_council_number=f'BC-{username}',
        experience_years=5,
        consultation_fee='5000.00',
        is_verified=True,
        city='Karachi',
        cnic=f'{username[:5]}-1234567-1',
    )
    return user, profile


def make_case_request(citizen_profile, lawyer_profile, title='Tax Dispute'):
    return CaseRequest.objects.create(
        requester=citizen_profile,
        lawyer=lawyer_profile,
        case_title=title,
        case_type='Civil',
        description='Test description.',
        urgency='medium',
        status='pending',
    )


# ─────────────────────────────────────────────────────────────────────────────
# Signal fire tests — verify signals fire (via side-effects in DB)
# ─────────────────────────────────────────────────────────────────────────────

class AcceptSignalTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()
        _, self.citizen = make_citizen('sig_citizen1')
        self.lawyer_user, self.lawyer = make_lawyer('sig_lawyer1')
        self.admin_user = make_user('sig_admin1', 'admin')
        self.case_request = make_case_request(self.citizen, self.lawyer)

    def test_accept_creates_notification_for_citizen(self):
        self.repo.accept_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            Notification.objects.filter(
                user=self.citizen.user,
                related_case=self.case_request,
            ).count(),
            1,
        )

    def test_accept_notification_message_mentions_title(self):
        self.repo.accept_request(self.case_request, performed_by=self.lawyer_user)
        n = Notification.objects.get(user=self.citizen.user, related_case=self.case_request)
        self.assertIn('Tax Dispute', n.message)
        self.assertIn('accepted', n.message)

    def test_accept_creates_audit_log(self):
        self.repo.accept_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='status_changed_to_accepted',
            ).count(),
            1,
        )

    def test_accept_audit_log_stores_performed_by(self):
        self.repo.accept_request(self.case_request, performed_by=self.lawyer_user)
        log = CaseAuditLog.objects.get(
            case_request=self.case_request,
            action='status_changed_to_accepted',
        )
        self.assertEqual(log.performed_by, self.lawyer_user)

    def test_accept_audit_log_metadata_contains_new_status(self):
        self.repo.accept_request(self.case_request, performed_by=self.lawyer_user)
        log = CaseAuditLog.objects.get(
            case_request=self.case_request,
            action='status_changed_to_accepted',
        )
        self.assertEqual(log.metadata.get('new_status'), 'accepted')


class RejectSignalTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()
        _, self.citizen = make_citizen('sig_citizen2')
        self.lawyer_user, self.lawyer = make_lawyer('sig_lawyer2')
        self.case_request = make_case_request(self.citizen, self.lawyer)

    def test_reject_creates_notification_for_citizen(self):
        self.repo.reject_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            Notification.objects.filter(
                user=self.citizen.user,
                related_case=self.case_request,
            ).count(),
            1,
        )

    def test_reject_notification_mentions_rejected(self):
        self.repo.reject_request(self.case_request, performed_by=self.lawyer_user)
        n = Notification.objects.get(user=self.citizen.user, related_case=self.case_request)
        self.assertIn('rejected', n.message)

    def test_reject_creates_audit_log(self):
        self.repo.reject_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='status_changed_to_rejected',
            ).count(),
            1,
        )


class StartProgressSignalTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()
        _, self.citizen = make_citizen('sig_citizen3')
        self.lawyer_user, self.lawyer = make_lawyer('sig_lawyer3')
        self.case_request = make_case_request(self.citizen, self.lawyer)

    def test_mark_in_progress_creates_audit_log(self):
        self.repo.mark_in_progress(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='status_changed_to_in_progress',
            ).count(),
            1,
        )

    def test_create_case_fires_case_assigned_signal(self):
        """create_case_from_request should create a CaseAuditLog with action='case_assigned'."""
        self.repo.create_case_from_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='case_assigned',
            ).count(),
            1,
        )

    def test_case_assigned_notification_created_for_citizen(self):
        self.repo.create_case_from_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            Notification.objects.filter(
                user=self.citizen.user,
                related_case=self.case_request,
            ).count(),
            1,
        )

    def test_create_case_idempotent_fires_signal_only_once(self):
        """Second call with existing case must not create a second audit log entry."""
        self.repo.create_case_from_request(self.case_request, performed_by=self.lawyer_user)
        self.repo.create_case_from_request(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='case_assigned',
            ).count(),
            1,
        )

    def test_case_assigned_audit_log_metadata_has_case_number(self):
        case = self.repo.create_case_from_request(self.case_request, performed_by=self.lawyer_user)
        log = CaseAuditLog.objects.get(case_request=self.case_request, action='case_assigned')
        self.assertEqual(log.metadata.get('case_number'), case.case_number)


class CompleteSignalTests(TestCase):
    def setUp(self):
        self.repo = CaseRepository()
        _, self.citizen = make_citizen('sig_citizen4')
        self.lawyer_user, self.lawyer = make_lawyer('sig_lawyer4')
        self.case_request = make_case_request(self.citizen, self.lawyer)

    def test_complete_fires_status_changed_audit_log(self):
        self.repo.mark_complete(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='status_changed_to_completed',
            ).count(),
            1,
        )

    def test_complete_also_fires_case_closed_audit_log(self):
        self.repo.mark_complete(self.case_request, performed_by=self.lawyer_user)
        self.assertEqual(
            CaseAuditLog.objects.filter(
                case_request=self.case_request,
                action='case_closed',
            ).count(),
            1,
        )

    def test_complete_creates_notification_for_citizen(self):
        self.repo.mark_complete(self.case_request, performed_by=self.lawyer_user)
        citizen_notifications = Notification.objects.filter(
            user=self.citizen.user,
            related_case=self.case_request,
        )
        self.assertEqual(citizen_notifications.count(), 1)

    def test_complete_creates_closed_notification_for_lawyer(self):
        self.repo.mark_complete(self.case_request, performed_by=self.lawyer_user)
        lawyer_notifications = Notification.objects.filter(
            user=self.lawyer_user,
            related_case=self.case_request,
        )
        self.assertEqual(lawyer_notifications.count(), 1)

    def test_complete_total_audit_log_entries(self):
        """mark_complete fires two signals → two audit log entries."""
        self.repo.mark_complete(self.case_request, performed_by=self.lawyer_user)
        total = CaseAuditLog.objects.filter(case_request=self.case_request).count()
        self.assertEqual(total, 2)

    def test_performed_by_none_still_creates_logs(self):
        """Signals fired with performed_by=None should still create audit rows."""
        self.repo.mark_complete(self.case_request, performed_by=None)
        self.assertEqual(
            CaseAuditLog.objects.filter(case_request=self.case_request).count(),
            2,
        )
        log = CaseAuditLog.objects.filter(
            case_request=self.case_request,
            action='case_closed',
        ).first()
        self.assertIsNone(log.performed_by)
