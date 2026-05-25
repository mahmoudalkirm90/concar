# serializers.py
from rest_framework import serializers
from .models import Car, Image, Notes, Fuel, Gearbox, Brand, Model , Feature


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Image
        fields = ['image']


class CarNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notes
        fields = ['content']


class FuelSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Fuel
        fields = ['name']


class GearboxSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Gearbox
        fields = ['name']

class FeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['name']
# ── List serializer — للعرض في الصفحة الرئيسية ──
class CarListSerializer(serializers.ModelSerializer):

    # إرجاع الأسماء مباشرةً بدل الـ IDs
    brand   = serializers.CharField(source='brand.name')
    model   = serializers.CharField(source='model.name')
    fuel    = serializers.CharField(source='fuel.name')
    gearbox = serializers.CharField(source='gearbox.name')

    class Meta:
        model  = Car
        fields = [
            'id',
            'brand',        # ← اسم البراند
            'model',        # ← اسم الموديل
            'model_year',
            'status',
            'is_available',
            'fuel',
            'gearbox',
            'cover_image',
            
        ]


# ── Detail serializer — لصفحة السيارة الواحدة ──
class CarDetailSerializer(serializers.ModelSerializer):

    brand   = serializers.CharField(source='brand.name')
    model   = serializers.CharField(source='model.name')
    fuel    = serializers.CharField(source='fuel.name')
    gearbox = serializers.CharField(source='gearbox.name')
    images  = CarImageSerializer(many=True, read_only=True)
    notes   = CarNotesSerializer(many=True, read_only=True)
    features = FeaturesSerializer(many=True, read_only=True)
    class Meta:
        model  = Car
        fields = [
            'id', 'brand', 'model', 'model_year', 'trim',
            'status', 'is_available', 'fuel', 'gearbox',
            'drive', 'body', 'color', 'engine_size',
            'horsepower', 'cylinders', 'seats', 'price',
            'original_price', 'has_discount', 'description',
            'cover_image', 'images', 'notes', 'features',
        ]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Brand
        fields = ['id', 'name']