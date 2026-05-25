from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import OrderingFilter, SearchFilter         # ✅ DRF OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend

from django.db.models import Q
from .models import *
from .serializers import (CarListSerializer,
                          CarDetailSerializer, 
                          BrandSerializer,
                          FuelSerializer)
from .filters import CarFilter


class CarListAPIView(generics.ListAPIView):
    serializer_class = CarListSerializer

    filter_backends  = [DjangoFilterBackend,SearchFilter, OrderingFilter]
    filterset_class  = CarFilter

    search_fields     = ['model__name', 'brand__name']
    # الحقول المسموح بالترتيب عليها
    ordering_fields  = ['created_at', 'price']
    ordering         = ['-created_at']          # الترتيب الافتراضي

    pagination_class = PageNumberPagination
    pagination_class.page_size = 9

    def get_queryset(self):
        return Car.objects.select_related('fuel', 'gearbox').all()
    

class CarDetailRetrievAPIView(generics.RetrieveAPIView):
    serializer_class = CarDetailSerializer
    queryset = Car.objects.all()

class BrandsListAPIView(generics.ListAPIView):
    serializer_class = BrandSerializer
    queryset = Brand.objects.all()

class FuelsListAPIView(generics.ListAPIView):
    serializer_class = FuelSerializer
    queryset = Fuel.objects.all()