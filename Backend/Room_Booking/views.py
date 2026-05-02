from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db.models import Q
from datetime import date

from .models import Room, OccupiedDates, Booking, User
from .serializers import (
    RoomSerializer, OccupiedDatesSerializer, BookingSerializer,
    UserSerializer, UserProfileSerializer, PasswordChangeSerializer,
)
from .permissions import IsAdminOrReadOnly


# ─── API Root ──────────────────────────────────────────
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'rooms': reverse('room-list', request=request, format=format),
        'bookings': reverse('booking-list', request=request, format=format),
    })


# ─── Rooms ─────────────────────────────────────────────
class RoomList(generics.ListCreateAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'room-list'

    def get_queryset(self):
        qs = Room.objects.all()
        # Filter by type
        room_type = self.request.query_params.get('type')
        if room_type:
            qs = qs.filter(type=room_type)

        # Filter by max price
        max_price = self.request.query_params.get('max_price')
        if max_price:
            qs = qs.filter(price_per_night__lte=max_price)

        # Filter by min price
        min_price = self.request.query_params.get('min_price')
        if min_price:
            qs = qs.filter(price_per_night__gte=min_price)

        # Filter by occupancy
        occupancy = self.request.query_params.get('occupancy')
        if occupancy:
            qs = qs.filter(max_occupancy__gte=occupancy)

        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))

        # Filter by availability (exclude rooms booked on given dates)
        avail_from = self.request.query_params.get('available_from')
        avail_to = self.request.query_params.get('available_to')
        if avail_from and avail_to:
            booked_room_ids = Booking.objects.filter(
                status='confirmed',
                check_in__lt=avail_to,
                check_out__gt=avail_from,
            ).values_list('room_id', flat=True)
            qs = qs.exclude(id__in=booked_room_ids)

        return qs


class RoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'room-detail'


# ─── Room Availability ─────────────────────────────────
class RoomAvailability(APIView):
    """GET /rooms/<id>/availability/ — returns booked date ranges for a room."""

    def get(self, request, pk):
        bookings = Booking.objects.filter(
            room_id=pk,
            status='confirmed',
            check_out__gte=date.today(),
        ).values('check_in', 'check_out')
        return Response(list(bookings))


# ─── Bookings ──────────────────────────────────────────
class BookingList(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    name = 'booking-list'

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.select_related('room', 'user')
        if not user.is_superuser and not user.is_staff:
            qs = qs.filter(user=user)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        # Filter upcoming vs past
        period = self.request.query_params.get('period')
        if period == 'upcoming':
            qs = qs.filter(check_in__gte=date.today(), status='confirmed')
        elif period == 'past':
            qs = qs.filter(check_out__lt=date.today())

        return qs

    def perform_create(self, serializer):
        room = serializer.validated_data['room']
        check_in = serializer.validated_data['check_in']
        check_out = serializer.validated_data['check_out']
        nights = (check_out - check_in).days
        total_price = nights * room.price_per_night
        serializer.save(user=self.request.user, total_price=total_price)


class BookingDetail(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    name = 'booking-detail'

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)


class BookingCancel(APIView):
    """POST /bookings/<id>/cancel/ — cancel a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        if booking.user != request.user and not request.user.is_superuser:
            raise PermissionDenied("Not your booking.")

        if booking.status == 'cancelled':
            return Response({'error': 'Already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response({'message': 'Booking cancelled.', 'id': booking.id})


# ─── Legacy OccupiedDates ──────────────────────────────
class OccupiedDatesList(generics.ListCreateAPIView):
    queryset = OccupiedDates.objects.all()
    serializer_class = OccupiedDatesSerializer
    permission_classes = [permissions.IsAuthenticated]
    name = 'occupied-dates-list'

    def get_queryset(self):
        user = self.request.user
        if not user.is_superuser and not user.is_staff:
            return OccupiedDates.objects.filter(user=user)
        return super().get_queryset()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OccupiedDatesDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = OccupiedDates.objects.all()
    serializer_class = OccupiedDatesSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'occupied-dates-detail'


# ─── Users ─────────────────────────────────────────────
class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    name = 'user-list'

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)


class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    name = 'user-detail'

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj == user or user.is_staff or user.is_superuser:
            return obj
        raise PermissionDenied("You are not authorized to view this user.")


# ─── Auth ──────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    name = 'register'

    def perform_create(self, serializer):
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        self.response_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            },
            "token": token.key,
        }

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = self.response_data
        return response


class Login(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is None:
            raise AuthenticationFailed("Invalid credentials")

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            },
            "token": token.key,
        })


class Logout(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logged out."})


# ─── Profile ──────────────────────────────────────────
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Refresh token
        request.user.auth_token.delete()
        token = Token.objects.create(user=request.user)
        return Response({'message': 'Password changed.', 'token': token.key})