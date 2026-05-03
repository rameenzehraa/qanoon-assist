from django.dispatch import Signal

# ── Signal definitions ────────────────────────────────────────────────────────
# Sent when a CaseRequest status changes (accept / reject / complete).
# kwargs: case_request, new_status, performed_by
case_status_changed = Signal()

# Sent when a Case is created from an accepted CaseRequest (start_progress).
# kwargs: case_request, case, performed_by
case_assigned = Signal()

# Sent in addition to case_status_changed when a case is marked completed.
# kwargs: case_request, performed_by
case_closed = Signal()


# ── Observers ─────────────────────────────────────────────────────────────────

class NotificationObserver:
    """Creates Notification rows via NotificationService in response to case lifecycle signals."""

    @staticmethod
    def on_status_changed(sender, case_request, new_status, performed_by, **kwargs):
        from utils import NotificationService

        status_messages = {
            'accepted': (
                case_request.requester.user,
                f"Your case request '{case_request.case_title}' has been accepted.",
            ),
            'rejected': (
                case_request.requester.user,
                f"Your case request '{case_request.case_title}' has been rejected.",
            ),
            'in_progress': (
                case_request.requester.user,
                f"Your case '{case_request.case_title}' is now in progress.",
            ),
            'completed': (
                case_request.requester.user,
                f"Your case '{case_request.case_title}' has been completed.",
            ),
        }

        entry = status_messages.get(new_status)
        if entry:
            user, message = entry
            NotificationService().dispatch(user, message, related_case=case_request)

    @staticmethod
    def on_case_assigned(sender, case_request, case, performed_by, **kwargs):
        from utils import NotificationService

        NotificationService().dispatch(
            case_request.requester.user,
            f"A case has been opened for your request '{case_request.case_title}'. Case number: {case.case_number}.",
            related_case=case_request,
        )

    @staticmethod
    def on_case_closed(sender, case_request, performed_by, **kwargs):
        from utils import NotificationService

        NotificationService().dispatch(
            case_request.lawyer.user,
            f"Case '{case_request.case_title}' has been marked as closed.",
            related_case=case_request,
        )


class AuditLogObserver:
    """Creates CaseAuditLog rows in response to case lifecycle signals."""

    @staticmethod
    def on_status_changed(sender, case_request, new_status, performed_by, **kwargs):
        from cases.models import CaseAuditLog

        CaseAuditLog.objects.create(
            case_request=case_request,
            action=f'status_changed_to_{new_status}',
            performed_by=performed_by,
            metadata={'new_status': new_status},
        )

    @staticmethod
    def on_case_assigned(sender, case_request, case, performed_by, **kwargs):
        from cases.models import CaseAuditLog

        CaseAuditLog.objects.create(
            case_request=case_request,
            action='case_assigned',
            performed_by=performed_by,
            metadata={'case_id': case.id, 'case_number': case.case_number},
        )

    @staticmethod
    def on_case_closed(sender, case_request, performed_by, **kwargs):
        from cases.models import CaseAuditLog

        CaseAuditLog.objects.create(
            case_request=case_request,
            action='case_closed',
            performed_by=performed_by,
        )


# ── Wire observers to signals ─────────────────────────────────────────────────
# dispatch_uid prevents duplicate connections when Django reloads modules.

case_status_changed.connect(
    NotificationObserver.on_status_changed,
    dispatch_uid='notification_observer_status_changed',
)
case_status_changed.connect(
    AuditLogObserver.on_status_changed,
    dispatch_uid='audit_observer_status_changed',
)

case_assigned.connect(
    NotificationObserver.on_case_assigned,
    dispatch_uid='notification_observer_case_assigned',
)
case_assigned.connect(
    AuditLogObserver.on_case_assigned,
    dispatch_uid='audit_observer_case_assigned',
)

case_closed.connect(
    NotificationObserver.on_case_closed,
    dispatch_uid='notification_observer_case_closed',
)
case_closed.connect(
    AuditLogObserver.on_case_closed,
    dispatch_uid='audit_observer_case_closed',
)
