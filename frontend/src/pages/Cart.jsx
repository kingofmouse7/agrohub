import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Cart.css';

const Cart = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('cart/');
      setCart(response.data);
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await api.post('cart/update/', {
        item_id: itemId,
        quantity: newQuantity
      });
      await fetchCart();
    } catch (err) {
      console.error('Ошибка обновления:', err);
      alert('Не удалось обновить количество');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Удалить товар из корзины?')) return;
    
    setUpdating(true);
    try {
      await api.post('cart/remove/', { item_id: itemId });
      await fetchCart();
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить товар');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
  if (!cart?.items?.length) {
    alert('Корзина пуста');
    return;
  }

  // Проверяем баланс
  if (cart.total > (user?.balance || 0)) {
    alert('Недостаточно средств на кошельке. Пополните баланс.');
    navigate('/wallet');
    return;
  }

  setCheckoutLoading(true);
  try {
    const address = prompt('Введите адрес доставки:');
    if (!address) {
      setCheckoutLoading(false);
      return;
    }

    const paymentMethod = prompt('Способ оплаты (card/cash):', 'card');
    if (!paymentMethod || !['card', 'cash'].includes(paymentMethod)) {
      alert('Выберите card или cash');
      setCheckoutLoading(false);
      return;
    }

    console.log('Отправляем заказ:', {
      shipping_address: address,
      payment_method: paymentMethod
    });

    const response = await api.post('cart/checkout/', {
      shipping_address: address,
      payment_method: paymentMethod
    });

    console.log('Ответ сервера:', response);

    if (response.status === 201 || response.status === 200) {
  // Успешное оформление
  
  // Получаем свежие данные пользователя
  try {
    const userResponse = await api.get('users/me/');
    const updatedUser = userResponse.data;
    
    // Обновляем в localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Если есть функция обновления в контексте - вызываем её
    // Например: updateUser(updatedUser);
    
  } catch (e) {
    console.error('Error fetching updated user:', e);
  }
  
  alert(`✅ Заказ успешно оформлен! Сумма ${cart.total} ₽ списана с кошелька.`);
  navigate('/profile');
}
  } catch (err) {
    console.error('Ошибка оформления:', err);
    
    // ПОДРОБНАЯ ДИАГНОСТИКА
    if (err.response) {
      // Сервер ответил с ошибкой
      console.log('Статус ошибки:', err.response.status);
      console.log('Данные ошибки:', err.response.data);
      console.log('Заголовки:', err.response.headers);
      
      if (err.response.status === 401) {
        alert('Сессия истекла. Войдите снова.');
        navigate('/login');
      } else if (err.response.status === 400) {
        // Ошибка валидации
        const errorData = err.response.data;
        let errorMessage = 'Ошибка в данных: ';
        
        if (errorData.error) {
          errorMessage += errorData.error;
        } else if (errorData.non_field_errors) {
          errorMessage += errorData.non_field_errors.join(', ');
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        } else {
          errorMessage += JSON.stringify(errorData);
        }
        
        alert(errorMessage);
      } else if (err.response.status === 403) {
        alert('У вас нет прав для этого действия');
      } else if (err.response.status === 404) {
        alert('Эндпоинт не найден. Проверьте URL /api/cart/checkout/');
      } else {
        alert(`Ошибка сервера: ${err.response.status}`);
      }
    } else if (err.request) {
      // Запрос был отправлен, но ответа нет
      console.log('Нет ответа от сервера:', err.request);
      alert('Сервер не отвечает. Проверьте соединение.');
    } else {
      // Ошибка при настройке запроса
      console.log('Ошибка запроса:', err.message);
      alert('Ошибка при отправке запроса');
    }
  } finally {
    setCheckoutLoading(false);
  }
};

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loader"></div>
        <p>Загружаем корзину...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h1 className="cart-title">🛒 Корзина</h1>
        <div className="empty-cart-message">
          <p>Ваша корзина пуста</p>
          <Link to="/categories" className="continue-shopping-btn">
            Перейти к покупкам
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">🛒 Корзина</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                {item.product_image ? (
                  <img 
                    src={`http://127.0.0.1:8000${item.product_image}`} 
                    alt={item.product_name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="cart-item-placeholder">🌾</div>';
                    }}
                  />
                ) : (
                  <div className="cart-item-placeholder">🌾</div>
                )}
              </div>
              
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.product_name}</h3>
                <p className="cart-item-price">{item.product_price} ₽ / {item.unit || 'шт'}</p>
              </div>
              
              <div className="cart-item-quantity">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating || item.quantity <= 1}
                  className="quantity-btn"
                >-</button>
                <span className="quantity-value">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating}
                  className="quantity-btn"
                >+</button>
              </div>
              
              <div className="cart-item-total">
                <strong>{(item.product_price * item.quantity).toFixed(2)} ₽</strong>
              </div>
              
              <button 
                onClick={() => removeItem(item.id)}
                disabled={updating}
                className="cart-item-remove"
                title="Удалить"
              >🗑️</button>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <h2>Итого</h2>
          
          <div className="summary-row">
            <span>Товаров:</span>
            <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
          </div>
          
          <div className="summary-row">
            <span>Сумма заказа:</span>
            <span>{cart.total} ₽</span>
          </div>
          
          <div className="summary-row">
            <span>Ваш баланс:</span>
            <span className={user?.balance >= cart.total ? 'balance-sufficient' : 'balance-insufficient'}>
              {Number(user?.balance || 0).toFixed(2)} ₽
            </span>
          </div>
          
          <div className="summary-row total">
            <span>К оплате:</span>
            <span>{cart.total} ₽</span>
          </div>
          
          {user?.balance < cart.total && (
            <div className="balance-warning">
              Недостаточно средств. <Link to="/wallet">Пополнить кошелёк</Link>
            </div>
          )}
          
          <button 
            onClick={handleCheckout}
            disabled={checkoutLoading || cart.items.length === 0 || user?.balance < cart.total}
            className="checkout-btn"
          >
            {checkoutLoading ? 'Оформление...' : 'Оформить заказ'}
          </button>
          
          <Link to="/categories" className="continue-shopping-link">
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;