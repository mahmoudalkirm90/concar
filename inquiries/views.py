from .serializers import InquirySerializer, InqueryListSerializer
from rest_framework.generics import CreateAPIView, ListAPIView,ListCreateAPIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Inquiry


class InquiryAPIView(ListCreateAPIView):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    pagination_class = PageNumberPagination
    pagination_class.page_size = 5
    def get_serializer_class(self, *args, **kwargs):
        if self.request.method == "POST": 
            return InquirySerializer
        return InqueryListSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message":"inquiry sent successfully"
            }
        )

    def get_queryset(self):
        return Inquiry.objects.filter(
            status= Inquiry.STATUS_CHOICES.ACCEPTED
        ).order_by('-created_at')
    # def get(self,request): 
    #     serializer = InqueryListSerializer(data=request.data) 
    #     result  = serializer.is_valid(raise_exception=True) 
    #     return Response({
    #         "data":result
    #     })
class ListAPIView(ListAPIView): 
    serializer_class = InqueryListSerializer

    def get_queryset(self):
        return Inquiry.objects.filter(
            status= Inquiry.STATUS_CHOICES.ACCEPTED,
            type__name="unavailable"
        ).order_by('-created_at')   