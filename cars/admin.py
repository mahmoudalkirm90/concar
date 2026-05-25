from django.contrib import admin
from .models import *
from django.utils.html import format_html

@admin.action(description="Mark selected cars as sold")
def sold_cars(modeladmin, request, queryset):
    queryset.update(is_available=False)


@admin.action(description="Mark selected cars as available")
def available_cars(modeladmin, request, queryset):
    queryset.update(is_available=True)

@admin.action(description="make a copy")
def make_copy(modeladmin, request, queryset) :
    for i in queryset:
        i.pk = None
        i.save()

class CarFeaturesInlin(admin.TabularInline):
    model = Feature
    extra = 1
class CarImageInline(admin.TabularInline):
    model = Image
    extra = 1
class CarNotesInline(admin.TabularInline):
    model = Notes
    extra = 1



@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('model', 'model_year', 'price', 'is_available')

    inlines = [CarFeaturesInlin,CarImageInline , CarNotesInline ]

    actions = [sold_cars, available_cars , make_copy]
    
models = [
    Model,
    Brand,
    Fuel,
    Gearbox 
]
admin.site.register(models)  