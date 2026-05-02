from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError


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


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='confirmed')
    guests = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.room.name} | {self.user.username} | {self.check_in} → {self.check_out}"

    def clean(self):
        if self.check_out <= self.check_in:
            raise ValidationError("Check-out must be after check-in.")

        if self.guests > self.room.max_occupancy:
            raise ValidationError(f"Max occupancy for this room is {self.room.max_occupancy}.")

        # Check for overlapping bookings on the same room
        overlapping = Booking.objects.filter(
            room=self.room,
            status='confirmed',
            check_in__lt=self.check_out,
            check_out__gt=self.check_in,
        ).exclude(pk=self.pk)

        if overlapping.exists():
            raise ValidationError("This room is already booked for the selected dates.")

    def save(self, *args, **kwargs):
        # Auto-calculate total price
        if not self.total_price:
            nights = (self.check_out - self.check_in).days
            self.total_price = nights * self.room.price_per_night
        self.full_clean()
        super().save(*args, **kwargs)


# Keep legacy model for backward compat
class OccupiedDates(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='occupied_dates')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='booked_dates')
    date = models.DateField()

    def __str__(self):
        return f"{self.room.name} - {self.user.username} - {self.date}"


class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200, default="")
