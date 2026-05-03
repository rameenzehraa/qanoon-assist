import threading


class NotificationService:
    """
    Singleton service for creating and querying Notification records.
    Thread-safe via double-checked locking on __new__.

    Usage:
        svc = NotificationService()
        svc.dispatch(user, "Your case was accepted.", related_case=case_request)
        svc.get_unread_count(user)
        svc.mark_all_read(user)

    Test isolation:
        NotificationService.reset()
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    # ── Public API ────────────────────────────────────────────────────────────

    def dispatch(self, user, message: str, related_case=None):
        """
        Create and return a Notification for `user`.
        `related_case` should be a CaseRequest instance or None.
        """
        from cases.models import Notification

        return Notification.objects.create(
            user=user,
            message=message,
            related_case=related_case,
        )

    def get_unread_count(self, user) -> int:
        """Return the number of unread Notifications for `user`."""
        from cases.models import Notification

        return Notification.objects.filter(user=user, is_read=False).count()

    def mark_all_read(self, user) -> int:
        """Mark all unread Notifications for `user` as read. Returns update count."""
        from cases.models import Notification

        updated, _ = Notification.objects.filter(user=user, is_read=False).update(is_read=True), None
        return updated

    # ── Test helper ───────────────────────────────────────────────────────────

    @classmethod
    def reset(cls):
        """Drop the singleton instance. For test isolation only."""
        with cls._lock:
            cls._instance = None
