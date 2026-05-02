from django.contrib import admin
from .models import Room, RoomImage, OccupiedDates, Booking


class RoomImageInline(admin.TabularInline):
    model = RoomImage
    extra = 1


class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'price_per_night', 'currency', 'max_occupancy')
    list_filter = ('type', 'currency')
    search_fields = ('name', 'description')
    inlines = [RoomImageInline]


class BookingAdmin(admin.ModelAdmin):
    list_display = ('room', 'user', 'check_in', 'check_out', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'room__type')
    search_fields = ('room__name', 'user__username')
    readonly_fields = ('total_price', 'created_at')


admin.site.register(Room, RoomAdmin)
admin.site.register(RoomImage)
admin.site.register(Booking, BookingAdmin)
admin.site.register(OccupiedDates)
