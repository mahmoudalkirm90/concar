from rest_framework import serializers
from .models import *
class TypeSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Type
        fields = ["name"]
class InquirySerializer(serializers.ModelSerializer):
    type = TypeSerializer()
    class Meta:
        model = Inquiry
        fields = ['name', 'phone', 'type', 'message']
    
    def create(self, validated_data):
        type_data = validated_data.pop('type')
        typeObj, _ = Type.objects.get_or_create(name=type_data.get('name'))

        Inquiry.objects.create(type=typeObj, **validated_data)
        
        return validated_data

class TypeSerializer(serializers.ModelSerializer): 
    class Meta: 
        model = Type
        fields = ['name']
class InqueryListSerializer(serializers.ModelSerializer):
    type = TypeSerializer()
    class Meta: 
        model = Inquiry
        fields = ["message","type"] 
        