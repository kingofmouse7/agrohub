import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="agro-header">
      <div className="header-container">
        <Link to="/" className="logo">
          🌾 Agrohub
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">Главная</Link>
          <Link to="/categories" className="nav-link">Категории</Link>

          {isAuthenticated && (
            <>
              <Link to="/wallet" className="nav-link">💰 Кошелек</Link>
              <Link to="/cart" className="nav-link">🛒 Корзина</Link>
            </>
          )}
        </nav>

        <div className="user-block">
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="user-name">
                👤 {user?.username || 'Профиль'}
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Вход</Link>
              <span className="auth-separator">|</span>
              <Link to="/register" className="auth-link">Регистрация</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;