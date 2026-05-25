from django.views.generic import TemplateView
from django.contrib import admin
from django.urls import path , include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/cars/', include('cars.urls')),
    path('api/inquiries/', include('inquiries.urls')),
    # ✅ Template — يرجع HTML
    path('cars/<int:pk>/', TemplateView.as_view(template_name='car-details-v2.html')),
    path('', TemplateView.as_view(template_name='index.html'))

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 