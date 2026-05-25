# filters.py
import django_filters
from .models import Car


class CarFilter(django_filters.FilterSet):
    # search يتولاه الـ view

    status       = django_filters.ChoiceFilter(choices=Car.STATUS.choices)
    is_available = django_filters.BooleanFilter()

    # ✅ brandname و modelname عبر NumberFilter على الـ FK id
    # تجنباً لتعارض django_filters مع أسماء الحقول
    brand        = django_filters.CharFilter(field_name='brand__name',    lookup_expr='iexact')
    fuel         = django_filters.CharFilter(field_name='fuel__name',     lookup_expr='iexact')
    transmission = django_filters.CharFilter(field_name='gearbox__name',  lookup_expr='iexact')
    body         = django_filters.ChoiceFilter(choices=Car.BODY.choices)
    drive        = django_filters.ChoiceFilter(choices=Car.DRIVE.choices)
    min_price    = django_filters.NumberFilter(field_name='price',        lookup_expr='gte')
    max_price    = django_filters.NumberFilter(field_name='price',        lookup_expr='lte')
    min_year     = django_filters.NumberFilter(field_name='model_year',   lookup_expr='gte')
    max_year     = django_filters.NumberFilter(field_name='model_year',   lookup_expr='lte')

    class Meta:
        model  = Car
        fields = [
            'status', 'is_available',
            'brand',
            'fuel', 'transmission',
            'body', 'drive',
            'min_price', 'max_price',
            'min_year',  'max_year',
        ]