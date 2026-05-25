from django.db import models
from customers.models import Customer

class Fuel(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
class Gearbox(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
class Model(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
class Brand(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
   

class Car(models.Model):
    class STATUS(models.TextChoices):
        NEW = 'new', 'New'
        USED = 'used', 'Used'
    class DRIVE(models.TextChoices):
        FWD = 'fwd', 'Front Wheel Drive'
        RWD = 'rwd', 'Rear Wheel Drive'
        AWD = 'awd', 'All Wheel Drive'
        FOUR = '4wd', '4 Wheel Drive'

    class BODY(models.TextChoices):
        SEDAN     = 'sedan',     'Sedan'
        SUV       = 'suv',       'SUV'
        COUPE     = 'coupe',     'Coupe'
        HATCHBACK = 'hatchback', 'Hatchback'
        PICKUP    = 'pickup',    'Pickup'
        VAN       = 'van',       'Van'
        CONVERTIBLE = 'convertible', 'Convertible'

    # brand and model
    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT
    )
    model = models.ForeignKey(
        Model,
        on_delete=models.PROTECT
    )
    model_year = models.IntegerField() 
    trim = models.CharField(max_length=100, blank=True) # نسخ المحرك

    # المواصفات التقنية
    gearbox = models.ForeignKey(
        Gearbox,
        on_delete=models.PROTECT,
      
    )
    fuel = models.ForeignKey(
        Fuel,
        on_delete= models.PROTECT,
    )
    drive = models.CharField(max_length=5, choices=DRIVE.choices, blank=True)
    body = models.CharField(max_length=15, choices=BODY.choices, blank=True)  # حجم السيارة sedan , van , ect ..
    color = models.CharField(max_length=50)
    engine_size  = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)  # مثل 2.0
    horsepower   = models.PositiveIntegerField(null=True, blank=True)
    cylinders    = models.PositiveSmallIntegerField(null=True, blank=True)
    seats        = models.PositiveSmallIntegerField(null=True, blank=True)
    

    # السعر
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # سعر قبل التخفيض

    customer = models.ForeignKey(
        Customer,
        on_delete= models.CASCADE,
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS.choices, default=STATUS.USED)

    is_available = models.BooleanField(default=True)
    
    # وصف السيارة ومميزاتها
    description = models.TextField(blank=True)
    # features one -> many
    
    coutner = models.PositiveBigIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # صورة الخلفية للسيارة
    cover_image = models.ImageField(upload_to='car_images/%Y/%m/%d', blank=True, null=True)
    
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_available']),
            models.Index(fields=['brand', 'model']),
            models.Index(fields=['price']),
        ]
    
    
    
    def __str__(self):
        return f"{self.model} {self.model_year}"
    
    @property
    def has_discount(self):
        return self.original_price and self.original_price > self.price
class Notes (models.Model): 
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note for {self.car.model}"

class Image(models.Model):
    """صور إضافية للسيارة"""
    car   = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='cars/gallery/%Y/%m/')
    order = models.PositiveSmallIntegerField(default=0)  # ترتيب العرض

    class Meta:
        ordering = ['order']

class Feature(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='features')
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"feaure for {self.car.brand} - {self.car.model} - {self.car.model_year}"