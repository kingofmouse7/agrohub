from rest_framework import generics, permissions, viewsets, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from decimal import Decimal, InvalidOperation
import logging
from .serializers import UserSerializer, RegisterSerializer, TransactionSerializer
from .models import User, Transaction

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Регистрация нового пользователя"""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class CustomAuthToken(ObtainAuthToken):
    """Кастомная аутентификация с возвратом токена и данных пользователя"""
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'balance': float(user.balance) if user.balance else 0
        })


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Просмотр пользователей (только для админа или своего профиля)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Просмотр и редактирование профиля текущего пользователя"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """Получение данных текущего пользователя"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_history(request):
    """История операций кошелька"""
    transactions = request.user.transactions.all().order_by('-created_at')
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_balance(request):
    """Пополнение баланса пользователя"""
    logger.info(f"Deposit request from user {request.user.id}: {request.data}")
    
    try:
        amount = request.data.get('amount')
        logger.info(f"Amount received: {amount}")
        
        if not amount:
            logger.warning("No amount provided")
            return Response(
                {'error': 'Amount is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = Decimal(str(amount))
            logger.info(f"Amount converted to Decimal: {amount}")
            if amount <= 0:
                logger.warning(f"Amount not positive: {amount}")
                return Response(
                    {'error': 'Amount must be positive'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (InvalidOperation, ValueError, TypeError) as e:
            logger.error(f"Amount conversion error: {str(e)}")
            return Response(
                {'error': 'Invalid amount format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        logger.info(f"Current user balance: {user.balance}")
        
        # Обновляем баланс
        user.balance += amount
        user.save()
        logger.info(f"New balance after save: {user.balance}")
        
        # Создаём транзакцию
        try:
            transaction = Transaction.objects.create(
                user=user,
                transaction_type='deposit',
                amount=amount,
                description=f'Пополнение кошелька на {amount} ₽'
            )
            logger.info(f"Transaction created: {transaction.id}")
        except Exception as e:
            logger.error(f"Error creating transaction: {str(e)}")
            # Даже если транзакция не создалась, баланс уже обновлён
        
        # Пробуем вернуть ответ
        response_data = {
            'success': True,
            'balance': float(user.balance),
            'message': f'Баланс успешно пополнен на {amount} ₽'
        }
        logger.info(f"Sending response: {response_data}")
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Unhandled exception in deposit_balance: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Internal server error'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


