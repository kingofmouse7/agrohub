from rest_framework import generics, permissions, viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, Review, ProductFile  
from .serializers import CategorySerializer, ProductSerializer, ReviewSerializer, ProductFileSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'seller', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductFileUploadView(generics.CreateAPIView):
    queryset = ProductFile.objects.all()
    serializer_class = ProductFileSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        product_id = self.request.data.get('product_id')
        if not product_id:
            raise PermissionDenied("product_id is required")
            
        product = get_object_or_404(Product, id=product_id)
        
        # Проверяем, что пользователь - продавец этого товара
        if product.seller != self.request.user:
            raise PermissionDenied("You can only add files to your own products")
            
        serializer.save(product=product)