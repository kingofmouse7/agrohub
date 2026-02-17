from django.contrib import admin
from .models import Category, Product, Review, ProductFile

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'parent']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'seller', 'category', 'price', 'stock', 'is_active']
    list_filter = ['category', 'is_active', 'seller']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name', 'description']
    raw_id_fields = ['seller']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'rating', 'created_at']
    list_filter = ['rating']

@admin.register(ProductFile)
class ProductFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'name', 'uploaded_at']