import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{ background: '#4CAF50', padding: '1rem', color: 'white' }}>
      <nav>
        <Link to="/" style={{ color: 'white', margin: '1rem' }}>Главная</Link>
        <Link to="/products" style={{ color: 'white', margin: '1rem' }}>Товары</Link>
        <Link to="/cart" style={{ color: 'white', margin: '1rem' }}>Корзина</Link>
        <Link to="/login" style={{ color: 'white', margin: '1rem' }}>Вход</Link>
      </nav>
    </header>
  );
};

export default Header;