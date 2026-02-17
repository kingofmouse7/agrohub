import React, { useState, useEffect } from 'react';
import Slider from '../components/Slider';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('products/?is_active=true');
      
      console.log('Ответ от API:', response.data);
      
      // Получаем массив товаров (с пагинацией или без)
      let productsArray = [];
      if (response.data.results) {
        // Если ответ с пагинацией
        productsArray = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Если ответ просто массив
        productsArray = response.data;
      } else {
        console.error('Неожиданный формат:', response.data);
        setError('Ошибка формата данных');
        setLoading(false);
        return;
      }
      
      setProducts(productsArray.slice(0, 8));
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
      setError('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Slider />
      
      <section className="products-section">
        <h2 className="section-title">
          🌟 Свежие предложения
          <span className="title-decoration"></span>
        </h2>
        
        {loading && (
          <div className="home-loading">
            <div className="loader"></div>
            <p>Загружаем товары...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="home-error">
            <p>😕 {error}</p>
            <button onClick={fetchProducts} className="retry-btn">
              Попробовать снова
            </button>
          </div>
        )}
        
        {!loading && !error && products.length === 0 && (
          <p className="no-products">Пока нет товаров</p>
        )}
        
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
};

export default Home;