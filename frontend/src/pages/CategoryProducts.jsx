import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import './CategoryProducts.css';

const CategoryProducts = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Получаем информацию о категории
      const categoryRes = await api.get(`categories/${slug}/`);
      setCategory(categoryRes.data);
      
      // Получаем товары категории
      const productsRes = await api.get(`products/?category=${categoryRes.data.id}&is_active=true`);
      const productsData = productsRes.data.results || productsRes.data || [];
      setProducts(productsData);
      
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    
    // Фильтр по цене
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }
    
    // Сортировка
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const handlePriceChange = (e) => {
    setPriceRange({
      ...priceRange,
      [e.target.name]: e.target.value
    });
  };

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSortBy('default');
  };

  const filteredProducts = applyFilters();

  if (loading) {
    return (
      <div className="category-loading">
        <div className="loader"></div>
        <p>Загружаем товары...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-not-found">
        <h2>Категория не найдена</h2>
        <Link to="/categories" className="back-link">← К категориям</Link>
      </div>
    );
  }

  return (
    <div className="category-products-page">
      {/* Хлебные крошки */}
      <div className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">Главная</Link>
        <span className="breadcrumb-separator"> / </span>
        <Link to="/categories" className="breadcrumb-link">Категории</Link>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">{category.name}</span>
      </div>
      
      <h1 className="category-title">{category.name}</h1>
      {category.description && (
        <p className="category-description">{category.description}</p>
      )}
      
      <div className="category-content">
        {/* Фильтры */}
        <div className="filters-sidebar">
          <h3>Фильтры</h3>
          
          <div className="filter-section">
            <h4>Цена</h4>
            <div className="price-inputs">
              <input
                type="number"
                name="min"
                placeholder="от"
                value={priceRange.min}
                onChange={handlePriceChange}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                name="max"
                placeholder="до"
                value={priceRange.max}
                onChange={handlePriceChange}
                className="price-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <h4>Сортировка</h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">По умолчанию</option>
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="name_asc">По имени (А-Я)</option>
              <option value="name_desc">По имени (Я-А)</option>
            </select>
          </div>
          
          <button onClick={resetFilters} className="reset-filters-btn">
            Сбросить фильтры
          </button>
        </div>
        
        {/* Список товаров */}
        <div className="products-container">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>В этой категории пока нет товаров</p>
              <Link to="/categories" className="back-link">← Другие категории</Link>
            </div>
          ) : (
            <>
              <p className="products-count">Найдено товаров: {filteredProducts.length}</p>
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;