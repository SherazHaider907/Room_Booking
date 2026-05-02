from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Room, RoomImage, OccupiedDates, Booking, User


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ['id', 'image', 'caption']


class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'name', 'type', 'price_per_night', 'currency', 'max_occupancy', 'description', 'images']


class BookingSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)
    room_type = serializers.CharField(source='room.type', read_only=True)
    room_image = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'room', 'room_name', 'room_type', 'room_image',
            'user', 'username', 'check_in', 'check_out',
            'total_price', 'status', 'guests', 'nights', 'created_at',
        ]
        read_only_fields = ['user', 'total_price', 'status', 'created_at']

    def get_room_image(self, obj):
        first = obj.room.images.first()
        if first and first.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(first.image.url)
            return first.image.url
        return None

    def get_nights(self, obj):
        return (obj.check_out - obj.check_in).days

    def validate(self, data):
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        room = data.get('room')
        guests = data.get('guests', 1)

        if check_out <= check_in:
            raise serializers.ValidationError("Check-out must be after check-in.")

        if guests > room.max_occupancy:
            raise serializers.ValidationError(f"Max occupancy is {room.max_occupancy} guests.")

        # Check overlapping confirmed bookings
        overlapping = Booking.objects.filter(
            room=room,
            status='confirmed',
            check_in__lt=check_out,
            check_out__gt=check_in,
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError("This room is already booked for the selected dates.")

        return data


class OccupiedDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = OccupiedDates
        fields = ['id', 'date', 'room', 'user']
        read_only_fields = ['user']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'full_name']

    def validate_password(self, value):
        return make_password(value)


class UserProfileSerializer(serializers.ModelSerializer):
    """For viewing/updating profile (no password)."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name']
        read_only_fields = ['id', 'username']


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
