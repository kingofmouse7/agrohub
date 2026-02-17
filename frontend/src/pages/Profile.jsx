import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { apiForm } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, logout, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [orders, setOrders] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: ''
  });

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const ordersRes = await api.get('orders/');
      setOrders(ordersRes.data.results || ordersRes.data || []);
      
      if (user?.role === 'seller') {
        const productsRes = await api.get(`products/?seller=${user.id}`);
        setUserProducts(productsRes.data.results || productsRes.data || []);
      }
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (editMode) {
      setFormData({
        email: user?.email || '',
        phone: user?.phone || '',
        username: user?.username || ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditMode(false);
        alert('Профиль успешно обновлен!');
      } else {
        alert('Ошибка при обновлении профиля');
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  // ИСПРАВЛЕННАЯ функция загрузки аватара
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Проверка размера (макс 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер 2MB');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const result = await updateProfile(formData);
      console.log('Avatar upload result:', result);
      console.log('New avatar URL:', result.data.avatar);
      
      if (result.success) {
        // Просто перезагружаем страницу для обновления
        window.location.reload();
      }
    } catch (err) {
      console.error('Ошибка загрузки аватара:', err);
      alert('Ошибка при загрузке аватара');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // НОВАЯ функция для получения URL аватара с timestamp
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    // Добавляем timestamp для сброса кэша браузера
    return `http://127.0.0.1:8000${avatarPath}?t=${Date.now()}`;
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Загружаем профиль...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="profile-title">
        👤 Личный кабинет
      </h1>
      
      <div className="profile-container">
        {/* Блок с информацией о пользователе */}
        <div className="profile-card">
          <h2 className="profile-section-title">Мои данные</h2>
          
          <div className="profile-avatar-section">
            <div className="profile-avatar" onClick={handleAvatarClick}>
              {/* ИСПРАВЛЕННЫЙ блок отображения аватара */}
              {user?.avatar ? (
                <img 
                  src={getAvatarUrl(user.avatar)}
                  alt={user.username}
                  onError={(e) => {
                    console.log('Error loading image:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="avatar-placeholder">${user?.username?.charAt(0).toUpperCase()}</div>`;
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {uploadingAvatar && (
                <div className="avatar-uploading">
                  <div className="loader-small"></div>
                </div>
              )}
              <div className="avatar-overlay">
                <span>📷</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          
          {editMode ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>Имя пользователя</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  disabled={saving}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={saving}
                />
              </div>
              
              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  disabled={saving}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              
              <div className="profile-actions">
                <button 
                  onClick={handleSaveProfile} 
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button 
                  onClick={handleEditToggle} 
                  className="profile-cancel-btn"
                  disabled={saving}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <p><strong>Имя:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email || 'не указан'}</p>
              <p><strong>Телефон:</strong> {user?.phone || 'не указан'}</p>
              <p><strong>Роль:</strong> {user?.role === 'seller' ? 'Продавец' : 'Покупатель'}</p>
              
              <div className="profile-actions">
                <button onClick={handleEditToggle} className="profile-edit-btn">
                  ✏️ Редактировать
                </button>
                <button onClick={handleLogout} className="profile-logout-btn">
                  🚪 Выйти
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Блок с заказами */}
        <div className="profile-card">
          <h2 className="profile-section-title">📦 Мои заказы</h2>
          
          {orders.length === 0 ? (
            <p className="profile-empty">У вас пока нет заказов</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-header">
                    <span className="order-id">Заказ №{order.id}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status === 'pending' && 'Ожидает оплаты'}
                      {order.status === 'paid' && 'Оплачен'}
                      {order.status === 'shipped' && 'Отправлен'}
                      {order.status === 'delivered' && 'Доставлен'}
                      {order.status === 'cancelled' && 'Отменён'}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>Дата: {new Date(order.created_at).toLocaleDateString()}</p>
                    <p>Сумма: {order.total_price} ₽</p>
                    <p>Товаров: {order.items?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Блок для продавца: его товары */}
        {user?.role === 'seller' && (
          <div className="profile-card">
            <h2 className="profile-section-title">🌾 Мои товары</h2>
            
            {userProducts.length === 0 ? (
              <p className="profile-empty">У вас пока нет товаров</p>
            ) : (
              <div className="products-list">
                {userProducts.map(product => (
                  <div key={product.id} className="product-item">
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p>Цена: {product.price} ₽ / {product.unit}</p>
                      <p>В наличии: {product.stock}</p>
                    </div>
                    <div className="product-actions">
                      <button className="product-edit-btn">✏️</button>
                      <button className="product-delete-btn">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="profile-add-product-btn">
              + Добавить товар
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;