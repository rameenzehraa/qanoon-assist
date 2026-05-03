from messaging.models import Message


class MessageRepository:
    def get_messages_for_case(self, case_request):
        """Return all messages for a case request, oldest first."""
        return (
            Message.objects
            .filter(case_request=case_request)
            .select_related('sender')
            .order_by('timestamp')
        )

    def mark_as_read(self, case_request, reader):
        """
        Mark as read all messages in a case thread that were not sent by `reader`.
        Returns the number of rows updated.
        """
        return (
            Message.objects
            .filter(case_request=case_request, is_read=False)
            .exclude(sender=reader)
            .update(is_read=True)
        )

    def get_unread_count(self, user):
        """
        Return the number of unread messages in threads the user participates in,
        excluding messages sent by that user.
        """
        if user.user_type == 'citizen':
            qs = Message.objects.filter(case_request__requester__user=user)
        elif user.user_type == 'lawyer':
            qs = Message.objects.filter(case_request__lawyer__user=user)
        else:
            return 0

        return qs.filter(is_read=False).exclude(sender=user).count()

    def get_stats_for_user(self, user):
        """
        Return sent/received/unread/total counts for a citizen or lawyer user.
        """
        if user.user_type == 'citizen':
            qs = Message.objects.filter(case_request__requester__user=user)
        elif user.user_type == 'lawyer':
            qs = Message.objects.filter(case_request__lawyer__user=user)
        else:
            return {'total_messages': 0, 'unread': 0, 'sent': 0, 'received': 0}

        return {
            'total_messages': qs.count(),
            'unread': qs.filter(is_read=False).exclude(sender=user).count(),
            'sent': qs.filter(sender=user).count(),
            'received': qs.exclude(sender=user).count(),
        }

    def get_all_messages(self):
        return Message.objects.all().select_related('sender', 'case_request')

    def get_unread_count_for_case(self, case_request, user):
        """Unread messages in a single case thread for a specific user."""
        return (
            Message.objects
            .filter(case_request=case_request, is_read=False)
            .exclude(sender=user)
            .count()
        )
