from django.db import models
from users.models import User


class Customer(models.Model):
    user = models.ForeignKey(
        User,
        on_delete= models.CASCADE,

    )
    name = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self):
        return self.name