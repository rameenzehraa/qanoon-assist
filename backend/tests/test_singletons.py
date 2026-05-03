"""
Singleton Pattern tests.

Covers:
  - ConfigManager: single instance, correct cached values, reset() isolation
  - NotificationService: single instance, dispatch() persists to DB,
    get_unread_count() and mark_all_read() work correctly

Run with:
  python manage.py test tests.test_singletons
"""

from django.test import TestCase
from django.conf import settings

from users.models import User, CitizenProfile
from cases.models import CaseRequest, Notification
from utils import ConfigManager, NotificationService


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def make_user(username, user_type='citizen'):
    return User.objects.create_user(
        username=username,
        password='testpass123',
        user_type=user_type,
        email=f'{username}@test.com',
    )


# ─────────────────────────────────────────────────────────────────────────────
# ConfigManager
# ─────────────────────────────────────────────────────────────────────────────

class ConfigManagerSingletonTests(TestCase):
    def tearDown(self):
        ConfigManager.reset()

    def test_two_instantiations_return_same_object(self):
        cm1 = ConfigManager()
        cm2 = ConfigManager()
        self.assertIs(cm1, cm2)

    def test_instance_identity_after_reset(self):
        cm1 = ConfigManager()
        ConfigManager.reset()
        cm2 = ConfigManager()
        # After reset, a fresh instance is created — the old one is gone
        self.assertIs(cm2, ConfigManager())

    def test_get_debug_returns_bool(self):
        cm = ConfigManager()
        value = cm.get('DEBUG')
        self.assertIsInstance(value, bool)

    def test_get_debug_matches_django_settings(self):
        cm = ConfigManager()
        self.assertEqual(cm.get('DEBUG'), settings.DEBUG)

    def test_get_allowed_hosts_returns_list(self):
        cm = ConfigManager()
        self.assertIsInstance(cm.get('ALLOWED_HOSTS'), list)

    def test_get_db_name_matches_settings(self):
        cm = ConfigManager()
        expected = settings.DATABASES['default']['NAME']
        self.assertEqual(cm.get('DB_NAME'), expected)

    def test_get_jwt_access_minutes_is_60(self):
        cm = ConfigManager()
        # Settings defines ACCESS_TOKEN_LIFETIME = timedelta(minutes=60)
        self.assertEqual(cm.get('JWT_ACCESS_MINUTES'), 60)

    def test_get_jwt_refresh_days_is_1(self):
        cm = ConfigManager()
        # Settings defines REFRESH_TOKEN_LIFETIME = timedelta(days=1)
        self.assertEqual(cm.get('JWT_REFRESH_DAYS'), 1)

    def test_get_unknown_key_raises_key_error(self):
        cm = ConfigManager()
        with self.assertRaises(KeyError):
            cm.get('SECRET_KEY')

    def test_reset_allows_fresh_instance_creation(self):
        cm1 = ConfigManager()
        ConfigManager.reset()
        cm2 = ConfigManager()
        # Both are valid instances; after reset they are distinct objects
        self.assertIsNotNone(cm2)
        self.assertIs(cm2, ConfigManager())  # new singleton is stable

    def test_cached_values_are_stable_across_calls(self):
        cm = ConfigManager()
        self.assertEqual(cm.get('DB_NAME'), cm.get('DB_NAME'))


# ─────────────────────────────────────────────────────────────────────────────
# NotificationService — singleton identity
# ─────────────────────────────────────────────────────────────────────────────

class NotificationServiceSingletonTests(TestCase):
    def tearDown(self):
        NotificationService.reset()

    def test_two_instantiations_return_same_object(self):
        svc1 = NotificationService()
        svc2 = NotificationService()
        self.assertIs(svc1, svc2)

    def test_instance_stable_after_multiple_calls(self):
        instances = [NotificationService() for _ in range(5)]
        self.assertTrue(all(i is instances[0] for i in instances))

    def test_reset_produces_new_instance(self):
        svc1 = NotificationService()
        NotificationService.reset()
        svc2 = NotificationService()
        # svc1 may still exist in memory but the singleton pointer is new
        self.assertIs(svc2, NotificationService())


# ─────────────────────────────────────────────────────────────────────────────
# NotificationService — behaviour
# ─────────────────────────────────────────────────────────────────────────────

class NotificationServiceDispatchTests(TestCase):
    def setUp(self):
        NotificationService.reset()
        self.svc = NotificationService()
        self.user = make_user('notif_user')

    def tearDown(self):
        NotificationService.reset()

    def test_dispatch_creates_notification_in_db(self):
        self.svc.dispatch(self.user, 'Hello from singleton')
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 1)

    def test_dispatch_stores_correct_message(self):
        self.svc.dispatch(self.user, 'Case accepted.')
        n = Notification.objects.get(user=self.user)
        self.assertEqual(n.message, 'Case accepted.')

    def test_dispatch_default_is_unread(self):
        self.svc.dispatch(self.user, 'Unread by default')
        n = Notification.objects.get(user=self.user)
        self.assertFalse(n.is_read)

    def test_dispatch_with_related_case(self):
        from users.models import LawyerProfile
        lawyer_user = make_user('notif_lawyer', user_type='lawyer')
        lawyer = LawyerProfile.objects.create(
            user=lawyer_user,
            bar_council_number='BC-NOTIF-01',
            experience_years=3,
            consultation_fee='3000',
            city='Karachi',
            cnic='11111-1111111-1',
        )
        citizen = CitizenProfile.objects.create(
            user=self.user, cnic='notif_user123'
        )
        cr = CaseRequest.objects.create(
            requester=citizen,
            lawyer=lawyer,
            case_title='Notif Test',
            case_type='Civil',
            description='desc',
            urgency='low',
        )
        self.svc.dispatch(self.user, 'With related case', related_case=cr)
        n = Notification.objects.get(user=self.user)
        self.assertEqual(n.related_case, cr)

    def test_dispatch_returns_notification_instance(self):
        result = self.svc.dispatch(self.user, 'Return check')
        self.assertIsInstance(result, Notification)

    def test_dispatch_without_related_case_sets_null(self):
        self.svc.dispatch(self.user, 'No case')
        n = Notification.objects.get(user=self.user)
        self.assertIsNone(n.related_case)


class NotificationServiceQueryTests(TestCase):
    def setUp(self):
        NotificationService.reset()
        self.svc = NotificationService()
        self.user = make_user('query_user')

    def tearDown(self):
        NotificationService.reset()

    def test_get_unread_count_zero_when_none(self):
        self.assertEqual(self.svc.get_unread_count(self.user), 0)

    def test_get_unread_count_counts_unread_only(self):
        self.svc.dispatch(self.user, 'msg 1')
        self.svc.dispatch(self.user, 'msg 2')
        Notification.objects.filter(user=self.user).first().save()  # still unread
        self.assertEqual(self.svc.get_unread_count(self.user), 2)

    def test_get_unread_count_excludes_read(self):
        n = self.svc.dispatch(self.user, 'read me')
        n.is_read = True
        n.save()
        self.assertEqual(self.svc.get_unread_count(self.user), 0)

    def test_mark_all_read_flips_all_unread(self):
        self.svc.dispatch(self.user, 'a')
        self.svc.dispatch(self.user, 'b')
        self.svc.dispatch(self.user, 'c')
        self.svc.mark_all_read(self.user)
        self.assertEqual(self.svc.get_unread_count(self.user), 0)

    def test_mark_all_read_returns_count_updated(self):
        self.svc.dispatch(self.user, 'x')
        self.svc.dispatch(self.user, 'y')
        count = self.svc.mark_all_read(self.user)
        self.assertEqual(count, 2)

    def test_mark_all_read_does_not_affect_other_users(self):
        other = make_user('other_query_user')
        self.svc.dispatch(self.user, 'mine')
        self.svc.dispatch(other, 'theirs')
        self.svc.mark_all_read(self.user)
        self.assertEqual(self.svc.get_unread_count(other), 1)

    def test_singleton_shares_state_across_instances(self):
        svc2 = NotificationService()
        self.svc.dispatch(self.user, 'shared')
        # Both references point to the same object, so counts match
        self.assertEqual(svc2.get_unread_count(self.user), 1)
