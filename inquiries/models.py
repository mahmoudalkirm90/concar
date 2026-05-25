from django.db import models

class Type(models.Model):
    name = models.CharField(max_length=100) 
    def __str__(self):
        return self.name
class Inquiry(models.Model):
    class STATUS_CHOICES(models.TextChoices):
        ACCEPTED = 'accepted','Accepted'
        REJECTED = 'rejected', 'Rejected'

    name = models.CharField(max_length=100) 
    phone = models.CharField(max_length=20)
    type = models.ForeignKey(
        Type,
        on_delete=models.PROTECT
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=15,
                               choices=STATUS_CHOICES,
                                 default=STATUS_CHOICES.REJECTED)
    
    def __str__(self):
        return f"{self.type} by {self.name}"