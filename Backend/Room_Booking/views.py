from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from .models import Room, OccupiedDates, User
from .serlizers import RoomSerializer, OccupiedDatesSerializer, UserSerializer
from rest_framework.authtoken.models import Token 
from rest_framework.views import APIView
from .permissions import IsAdminOrReadOnly
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'rooms': reverse('room-list', request=request, format=format),
    })


class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'room-list'



class RoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'room-detail'



class OccupiedDatesList(generics.ListCreateAPIView):
    queryset = OccupiedDates.objects.all()
    serializer_class = OccupiedDatesSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    name = 'occupied-dates-list'

    def get_queryset(self):
        user = self.request.user
        if not user.is_superuser and not user.is_staff:
            return OccupiedDates.objects.filter(user=user)
        return super().get_queryset()

class OccupiedDatesDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = OccupiedDates.objects.all()
    serializer_class = OccupiedDatesSerializer
    permission_classes = [IsAdminOrReadOnly]
    name = 'occupied-dates-detail'



class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    name = 'user-list'

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.is_staff:
            return User.objects.all()
        else:
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
        
        raise PermissionDenied("You are not authorized to view this user")

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    name = 'register'

    def perform_create(self, serializer):
        user = serializer.save()

        token, created = Token.objects.get_or_create(user=user)
        self.response_data = {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            
            },
            "token": token.key
        }

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = self.response_data
        return response

class Login(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username= username, password=password)
        
        if user is None:
            raise AuthenticationFailed("Invalid credentials")

        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
            },
            "token": token.key
        })
    
    