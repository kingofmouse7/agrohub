import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
      return;
    }

    try {
      await api.post('cart/add/', {
        product_id: product.id,
        quantity: 1
      });
      alert('Товар добавлен в корзину!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Ошибка при добавлении в корзину');
    }
  };
  
  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-image-link">
        <div className="product-image">
          {product.image ? (
            <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} />
          ) : (
            <div className="no-image">🌾</div>
          )}
          
          {!product.is_active && (
            <span className="product-status">Нет в наличии</span>
          )}
        </div>
      </Link>
      
      <div className="product-info">
        <Link to={`/product/${product.slug}`} className="product-name">
          {product.name}
        </Link>
        
        <div className="product-meta">
          <span className="product-price">
            {product.price} ₽/{product.unit}
          </span>
          <span className="product-stock">
            {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет'}
          </span>
        </div>
        
        <p className="product-description">
          {product.description?.substring(0, 60)}...
        </p>
        
        <div className="product-seller">
          Продавец: {product.seller_username || 'Фермер'}
        </div>
        
        <button 
          onClick={handleAddToCart}
          className="add-to-cart-btn"
          disabled={!product.is_active || product.stock === 0}
        >
          {product.is_active && product.stock > 0 
            ? 'В корзину' 
            : 'Нет в наличии'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;