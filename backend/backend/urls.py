"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from products.views import CategoryViewSet, ProductViewSet, ReviewViewSet, ProductFileUploadView
from orders.views import OrderViewSet, CartViewSet
from users.views import RegisterView, CustomAuthToken, UserViewSet, UserProfileView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/cart/', CartViewSet.as_view({'get': 'list'})),
    path('api/cart/add/', CartViewSet.as_view({'post': 'add_item'})),
    path('api/cart/remove/', CartViewSet.as_view({'post': 'remove_item'})),
    path('api/cart/update/', CartViewSet.as_view({'post': 'update_quantity'})),
    path('api/cart/checkout/', CartViewSet.as_view({'post': 'checkout'})),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/login/', CustomAuthToken.as_view(), name='login'),
    path('api/upload-file/', ProductFileUploadView.as_view(), name='upload-file'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)