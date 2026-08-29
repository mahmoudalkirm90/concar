from django.urls import path
from .views import InquiryAPIView,ListAPIView
urlpatterns = [
    path('' , InquiryAPIView.as_view(), name='inquiry-create'),
    path('list', ListAPIView.as_view(), name='inquiry-list')
]