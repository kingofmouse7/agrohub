import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: 'buyer',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверка паролей
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone
      });

      if (result.success) {
        navigate('/login', { 
          state: { message: 'Регистрация успешна! Теперь войдите в систему.' }
        });
      } else {
        // Обработка ошибок с сервера
        const errorData = result.error;
        if (typeof errorData === 'object') {
          const messages = Object.values(errorData).flat().join(' ');
          setError(messages);
        } else {
          setError('Ошибка при регистрации');
        }
      }
    } catch (err) {
      setError('Ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">🌾 Регистрация в Agrohub</h1>
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Придумайте логин"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Ваш email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Роль</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="buyer">Покупатель</option>
              <option value="seller">Продавец</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Придумайте пароль"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Подтверждение пароля *</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Повторите пароль"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <p className="auth-link-text">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">
          Войти
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;