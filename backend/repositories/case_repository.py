from django.utils import timezone
from django.db.models import Prefetch

from cases.models import CaseRequest, Case, Hearing, CaseUpdate


class CaseRepository:
    # ── CaseRequest queries ──────────────────────────────────────────────────

    def get_requests_for_citizen(self, citizen_profile):
        """
        Return CaseRequests for a citizen with all related objects prefetched
        so serializer method fields don't generate extra queries.
        """
        from messaging.models import Message

        return (
            CaseRequest.objects
            .filter(requester=citizen_profile)
            .select_related('requester__user', 'lawyer__user')
            .prefetch_related(
                Prefetch('case', queryset=Case.objects.prefetch_related('hearings', 'updates')),
                Prefetch('messages', queryset=Message.objects.select_related('sender')),
            )
            .order_by('-request_date')
        )

    def get_requests_for_lawyer(self, lawyer_profile):
        """
        Return CaseRequests for a lawyer with all related objects prefetched.
        """
        from messaging.models import Message

        return (
            CaseRequest.objects
            .filter(lawyer=lawyer_profile)
            .select_related('requester__user', 'lawyer__user')
            .prefetch_related(
                Prefetch('case', queryset=Case.objects.prefetch_related('hearings', 'updates')),
                Prefetch('messages', queryset=Message.objects.select_related('sender')),
            )
            .order_by('-request_date')
        )

    def get_request_stats(self, profile, role):
        """
        Return status-count dict for a citizen or lawyer profile.
        role: 'citizen' | 'lawyer'
        """
        if role == 'citizen':
            qs = CaseRequest.objects.filter(requester=profile)
        else:
            qs = CaseRequest.objects.filter(lawyer=profile)

        return {
            'total_requests': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'accepted': qs.filter(status='accepted').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'completed': qs.filter(status='completed').count(),
            'rejected': qs.filter(status='rejected').count(),
        }

    # ── CaseRequest mutations ────────────────────────────────────────────────

    def accept_request(self, case_request, message='Request accepted'):
        case_request.status = 'accepted'
        case_request.response_date = timezone.now()
        case_request.response_message = message
        case_request.save(update_fields=['status', 'response_date', 'response_message'])
        return case_request

    def reject_request(self, case_request, message='Request rejected'):
        case_request.status = 'rejected'
        case_request.response_date = timezone.now()
        case_request.response_message = message
        case_request.save(update_fields=['status', 'response_date', 'response_message'])
        return case_request

    def mark_in_progress(self, case_request):
        case_request.status = 'in_progress'
        case_request.save(update_fields=['status'])
        return case_request

    def mark_complete(self, case_request):
        case_request.status = 'completed'
        case_request.save(update_fields=['status'])
        return case_request

    def mark_viewed(self, case_request):
        case_request.last_viewed_at = timezone.now()
        case_request.save(update_fields=['last_viewed_at'])
        return case_request

    # ── Case queries / creation ──────────────────────────────────────────────

    def get_all_requests(self):
        return CaseRequest.objects.all().select_related('requester__user', 'lawyer__user')

    def get_case_request_by_id(self, case_request_id):
        """Return a CaseRequest by pk, or None."""
        return CaseRequest.objects.filter(id=case_request_id).first()

    def get_case_by_id(self, case_id):
        """Return a Case by pk, or None."""
        return Case.objects.filter(id=case_id).first()

    def get_all_cases(self):
        return Case.objects.all()

    def get_case_for_request(self, case_request):
        """Return the linked Case for a CaseRequest, or None."""
        return Case.objects.filter(case_request=case_request).first()

    def create_case_from_request(self, case_request):
        """
        Create and return a Case from a CaseRequest.
        No-ops if a Case already exists for this request.
        """
        existing = Case.objects.filter(case_request=case_request).first()
        if existing:
            return existing

        return Case.objects.create(
            citizen=case_request.requester,
            lawyer=case_request.lawyer,
            case_request=case_request,
            title=case_request.case_title,
            description=case_request.description,
            status='active',
        )

    def get_cases_for_citizen(self, citizen_profile):
        return Case.objects.filter(citizen=citizen_profile).order_by('-filing_date')

    def get_cases_for_lawyer(self, lawyer_profile):
        return Case.objects.filter(lawyer=lawyer_profile).order_by('-filing_date')

    # ── Hearing queries ──────────────────────────────────────────────────────

    def get_hearings_for_citizen(self, citizen_profile):
        return Hearing.objects.filter(case__citizen=citizen_profile)

    def get_hearings_for_lawyer(self, lawyer_profile):
        return Hearing.objects.filter(case__lawyer=lawyer_profile)

    def get_all_hearings(self):
        return Hearing.objects.all()

    # ── CaseUpdate queries ───────────────────────────────────────────────────

    def get_updates_for_citizen(self, citizen_profile):
        return CaseUpdate.objects.filter(case__citizen=citizen_profile)

    def get_updates_for_lawyer(self, lawyer_profile):
        return CaseUpdate.objects.filter(case__lawyer=lawyer_profile)

    def get_all_updates(self):
        return CaseUpdate.objects.all()

    # ── Notification helper ──────────────────────────────────────────────────

    def has_new_updates(self, case_request, since):
        """
        Return True if there are Hearings or CaseUpdates on the linked Case
        created after `since`.  If `since` is None, returns True whenever
        any hearing or update exists at all.

        Works with prefetched data (no extra queries) if the queryset was
        built with get_requests_for_citizen / get_requests_for_lawyer.
        """
        try:
            case = case_request.case
        except Case.DoesNotExist:
            return False

        if since is None:
            return bool(list(case.hearings.all())) or bool(list(case.updates.all()))

        return (
            any(h.created_at > since for h in case.hearings.all())
            or any(u.created_at > since for u in case.updates.all())
        )
