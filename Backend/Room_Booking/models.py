import email
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
class Room(models.Model):
    ROOM_TYPES = [
        ('Single', 'Single'),
        ('Double', 'Double'),
        ('Suite', 'Suite'),
    ]

    CURRENCY_TYPES = [
        ('USD', 'USD'),
        ('EUR', 'EUR'),
        ('GBP', 'GBP'),
    ]

    name = models.CharField(max_length=200, blank=True)
    type = models.CharField(max_length=10, choices=ROOM_TYPES)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, choices=CURRENCY_TYPES, default="USD", blank=True)
    max_occupancy = models.IntegerField(default=1)
    description = models.TextField(max_length=2000, blank=True)

    def __str__(self):
        return f"{self.name} - {self.type}"
    

class RoomImage(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='room_images/')
    caption = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Image for {self.room.name} - {self.caption or 'No Caption'} "


class OccupiedDates(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='occupied_dates')
    user  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='booked_dates')
    date = models.DateField()

    def __str__(self):
        return f"{self.room.name} - {self.user.username} - {self.date}"

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200,default="")
    

