from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.api_root, name="api-root"),

    # Rooms
    path('rooms/', views.RoomList.as_view(), name='room-list'),
    path('rooms/<int:pk>/', views.RoomDetail.as_view(), name='room-detail'),
    path('rooms/<int:pk>/availability/', views.RoomAvailability.as_view(), name='room-availability'),

    # Bookings
    path('bookings/', views.BookingList.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', views.BookingDetail.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/cancel/', views.BookingCancel.as_view(), name='booking-cancel'),

    # Legacy occupied dates
    path('occupied-dates/', views.OccupiedDatesList.as_view(), name='occupied-dates-list'),
    path('occupied-dates/<int:pk>/', views.OccupiedDatesDetail.as_view(), name='occupied-dates-detail'),

    # Users
    path('users/', views.UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='user-detail'),

    # Auth
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.Login.as_view(), name='login'),
    path('logout/', views.Logout.as_view(), name='logout'),

    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('password-change/', views.PasswordChangeView.as_view(), name='password-change'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)