// Базовый URL сервера
const BASE_URL = 'http://127.0.0.1:8000';

/**
 * Возвращает полный URL изображения
 * @param {string} imagePath - путь к изображению из API
 * @returns {string} полный URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Если это уже полный URL
  if (imagePath.startsWith('http')) return imagePath;
  
  // Если путь начинается с /media, просто добавляем базовый URL
  if (imagePath.startsWith('/media')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Если путь не начинается с /media, добавляем его
  return `${BASE_URL}/media/${imagePath}`;
};

/**
 * Обработчик ошибки загрузки изображения
 * @param {Event} e - событие ошибки
 * @param {string} fallbackText - текст для плейсхолдера
 */
export const handleImageError = (e, fallbackText = '🌾') => {
  console.error('Image load error:', e.target.src);
  e.target.style.display = 'none';
  const parent = e.target.parentElement;
  
  // Создаём плейсхолдер если его нет
  if (!parent.querySelector('.image-placeholder')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.textContent = fallbackText;
    parent.appendChild(placeholder);
  }
};