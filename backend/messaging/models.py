from django.db import models
from users.models import User
from cases.models import Case

class Message(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    attachment = models.FileField(upload_to='message_attachments/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)  # Fixed
    is_read = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'messages'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Message from {self.sender.username} in {self.case.title}"