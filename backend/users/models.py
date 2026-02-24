from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Покупатель'),
        ('seller', 'Продавец'),
        ('admin', 'Администратор'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # новое поле
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('deposit', 'Пополнение'),
        ('payment', 'Оплата'),
        ('refund', 'Возврат'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.created_at}"