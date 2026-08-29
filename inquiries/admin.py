from django.contrib import admin
from django.utils.html import format_html
from .models import Inquiry
# Register your models here.

@admin.action(description="mark inquiry as Accepted")
def accept(modeladmin, request, queryset):
    queryset.update(status=Inquiry.STATUS_CHOICES.ACCEPTED)

@admin.action(description="mark inquiry as Reject")
def reject(modeladmin, request, queryset):
    queryset.update(status=Inquiry.STATUS_CHOICES.REJECTED)
@admin.action(description="make a copy")
def make_copy(modeladmin, request, queryset) :
    for i in queryset:
        i.pk = None
        i.save()

@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['phone','name', 'type', 'created_at', 'status']
    actions = [accept, reject,make_copy]
    list_filter = ['status', 'created_at']