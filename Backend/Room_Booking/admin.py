from django.contrib import admin

from .models import Room, RoomImage, OccupiedDates


class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'price_per_night', 'currency', 'max_occupancy')
    list_filter = ('type',)
    search_fields = ('name',)   

admin.site.register(Room, RoomAdmin)
admin.site.register(RoomImage)
admin.site.register(OccupiedDates)
