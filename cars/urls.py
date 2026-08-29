from django.urls import path, re_path
from django.views.generic import TemplateView
from .views import *
urlpatterns = [
    path('', CarListAPIView.as_view(), name = 'car-list'),
    path('<int:pk>', CarDetailRetrievAPIView.as_view(), name='car-details'),

# ✅ API — يبقى يرجع JSON
    path('api/cars/<int:pk>/', CarDetailRetrievAPIView.as_view()),  
    path('brands/', BrandsListAPIView.as_view()),
    path('fuels/', FuelsListAPIView.as_view()),
] 