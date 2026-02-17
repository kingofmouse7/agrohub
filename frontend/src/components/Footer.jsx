import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="agro-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>🌾 Agrohub</h4>
          <p>Маркетплейс сельскохозяйственных товаров</p>
          <p>Свежие продукты прямо от фермеров</p>
        </div>
        
        <div className="footer-section">
          <h4>Навигация</h4>
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/categories">Категории</a></li>
            <li><a href="/about">О нас</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>📞 +7 (999) 123-45-67</p>
          <p>✉️ info@agrohub.ru</p>
          <p>📍 г. Москва, ул. Фермерская, 1</p>
        </div>
        
        <div className="footer-section">
          <h4>Мы в соцсетях</h4>
          <div className="social-links">
            <a href="#">📘</a>
            <a href="#">📷</a>
            <a href="#">▶️</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Agrohub. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;