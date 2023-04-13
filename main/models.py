from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Liked(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    url = models.CharField(max_length=500)
    title = models.CharField(max_length=200)
    naat_khwan = models.CharField(default='',max_length=200)
    
    def __str__(self):
        return self.title