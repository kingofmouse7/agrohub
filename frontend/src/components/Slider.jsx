import React, { useState, useEffect } from 'react';
import './Slider.css';

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Свежий урожай 2026!",
      description: "Картофель, морковь, свекла по специальным ценам",
      image: "/images/slide1.jpg",
      buttonLink: "/categories/vegetables"
    },
    {
      id: 2,
      title: "Скидка 20% на семена",
      description: "Подготовься к посевному сезону с выгодой",
      image: "/images/slide2.jpg",
      buttonText: "Выбрать семена",
      buttonLink: "/categories/seeds"
    },
    {
      id: 3,
      title: "Бесплатная доставка",
      description: "При заказе от 3000 рублей в любой регион",
      image: "/images/slide3.jpg",
      buttonText: "Подробнее",
      buttonLink: "/delivery"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="agro-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
          >
            <div className="slide-content">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-description">{slide.description}</p>
              <a href={slide.buttonLink} className="slide-button">
                {slide.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
      
      <button className="slider-nav prev" onClick={prevSlide}>‹</button>
      <button className="slider-nav next" onClick={nextSlide}>›</button>
      
      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;