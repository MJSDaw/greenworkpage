import React from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import prueba from '../assets/img/pruebas.webp'

const SpacesCarousel = () => {
  const settings = {
  className: 'center',
  centerMode: true,
  infinite: true,
  centerPadding: '0', // Cambiado a 0 para mejor control
  slidesToShow: 3,
  speed: 500,
  focusOnSelect: true,
  initialSlide: 1,
  arrows: true, // Asegura que las flechas estén visibles
  dots: true, // Muestra los puntos de navegación
};

  const images = [
    'https://via.placeholder.com/300x200?text=Imagen+1',
    'https://via.placeholder.com/300x200?text=Imagen+2',
    'https://via.placeholder.com/300x200?text=Imagen+3',
    'https://via.placeholder.com/300x200?text=Imagen+4',
    'https://via.placeholder.com/300x200?text=Imagen+5',
    'https://via.placeholder.com/300x200?text=Imagen+6',
  ]

  return (
    <section className="carousel__container">
      <h2>Nuestros espacios</h2>
      <div className="carousel__content">
        <Slider {...settings}>
          {images.map((img, index) => (
            <div key={index}>
              <img
                src={prueba}
                alt={`Slide ${index + 1}`}
                className="carousel-img"
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  )
}

export default SpacesCarousel
