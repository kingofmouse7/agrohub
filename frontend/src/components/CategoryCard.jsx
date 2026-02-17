import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  const getIcon = (name) => {
    const icons = {
      'овощи': '🥕',
      'фрукты': '🍎',
      'зерно': '🌾',
      'техника': '🚜',
      'удобрения': '🧪',
      'семена': '🌱',
      'животные': '🐄',
      'корма': '🌽',
      'инвентарь': '🔧',
    };
    
    const lowerName = name.toLowerCase();
    for (let key in icons) {
      if (lowerName.includes(key)) {
        return icons[key];
      }
    }
    return '🌿';
  };

  return (
    <Link to={`/categories/${category.slug}`} className="category-card">
      <div className="category-icon">
        {getIcon(category.name)}
      </div>
      <h3 className="category-name">{category.name}</h3>
      {category.description && (
        <p className="category-description">{category.description.substring(0, 60)}...</p>
      )}
      <span className="category-link">Перейти →</span>
    </Link>
  );
};

export default CategoryCard;