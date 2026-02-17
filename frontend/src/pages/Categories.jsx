import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CategoryCard from '../components/CategoryCard';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('categories/');
      
      console.log('Категории с сервера:', response.data);
      
      let categoriesData = [];
      if (response.data.results) {
        categoriesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else {
        setError('Неверный формат данных');
        return;
      }
      
      // Убираем дубликаты по id (на всякий случай)
      const uniqueMap = new Map();
      categoriesData.forEach(cat => uniqueMap.set(cat.id, cat));
      const uniqueCategories = Array.from(uniqueMap.values());
      
      console.log('Категории после удаления дубликатов:', uniqueCategories);
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setError('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-loading">
        <div className="loader"></div>
        <p>Загружаем категории...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-error">
        <p>😕 {error}</p>
        <button onClick={fetchCategories} className="retry-btn">
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <h1 className="categories-title">
        🌾 Категории товаров
        <span className="title-decoration"></span>
      </h1>
      
      {categories.length === 0 ? (
        <p className="no-categories">Пока нет категорий</p>
      ) : (
        <div className="categories-grid">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;