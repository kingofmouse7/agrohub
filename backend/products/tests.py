import pytest
from django.contrib.auth import get_user_model
from products.models import Category, Product

User = get_user_model()

@pytest.mark.django_db
class TestProductModel:
    def test_create_product(self):
        seller = User.objects.create_user(
            username='seller',
            password='testpass123',
            role='seller'
        )

        category = Category.objects.create(
            name='Овощи',
            slug='vegetables'
        )
        
        product = Product.objects.create(
            seller=seller,
            category=category,
            name='Картошка',
            slug='potato',
            description='Свежая картошка',
            price=50.00,
            stock=100,
            unit='kg'
        )
        
        assert product.name == 'Картошка'
        assert product.seller == seller
        assert product.category == category
        assert product.price == 50.00
        assert str(product) == 'Картошка'