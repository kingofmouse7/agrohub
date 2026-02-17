import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // ← ЭТА СТРОКА
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/profile');
      } else {
        setError(result.error || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">🌾 Вход в Agrohub</h1>
        
        {successMessage && (
          <div className="auth-success">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Введите логин"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Введите пароль"
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p className="auth-link-text">
          Ещё нет аккаунта?{' '}
          <Link to="/register" className="auth-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;