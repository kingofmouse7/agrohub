from rest_framework import serializers
from .models import Category, Product, Review, ProductFile

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent']

class ProductSerializer(serializers.ModelSerializer):
    seller_username = serializers.ReadOnlyField(source='seller.username')
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'stock', 
                  'unit', 'image', 'seller', 'seller_username', 
                  'category', 'category_name', 'is_active', 'created_at']
        read_only_fields = ['seller', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_username', 'product', 'rating', 'comment', 'created_at']

class ProductFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFile
        fields = ['id', 'product', 'file', 'name', 'uploaded_at']
        read_only_fields = ['uploaded_at']