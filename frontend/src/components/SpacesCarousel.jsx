import React, { useState, useEffect } from 'react'
import Slider from 'react-slick'
import { useTranslation } from 'react-i18next'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import SpaceCard from './SpaceCard'
import prueba from '../assets/img/pruebas.webp'
import arrow from '../assets/img/arrow.svg'
import { getSpaces } from '../services/apiService'

const NextArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={`${className} custom-arrow next-arrow`}
      onClick={onClick}
      style={{
        display: 'block',
        right: '20px',
        zIndex: 1
      }}
    >
      <img src={arrow} alt="Next" className="arrow-image" />
    </div>
  )
}

const PrevArrow = (props) => {
  const { className, onClick } = props
  return (
    <div
      className={`${className} custom-arrow prev-arrow`}
      onClick={onClick}
      style={{
        display: 'block',
        left: '20px',
        zIndex: 1
      }}
    >
      <img src={arrow} alt="Previous" className="arrow-image prev" />
    </div>
  )
}

const SpacesCarousel = () => {
  const { t } = useTranslation()
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const response = await getSpaces()
        if (response && response.data) {
          const spacesData = response.data.slice(0, 4).map(space => ({
            id: space.id,
            src: `https://localhost:8443/storage/${space.images.split('|')[0]}`,
            subtitle: space.subtitle,
            amount: space.price,
            maps: '',
            seats: space.places,
            link: ''
          }))
          setSpaces(spacesData)
        }
      } catch (error) {
        console.error('Error al cargar espacios:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpaces()
  }, [])

  const settings = {
    className: 'center',
    centerMode: true,
    infinite: true,
    centerPadding: '0',
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: false,
    initialSlide: 0,
    arrows: true,
    dots: true,
    swipe: true,
    touchMove: true,
    draggable: true,
    adaptiveHeight: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1350,
        settings: {
          slidesToShow: 2,
          centerMode: false,
          dots: true,
        },
      },
      {
        breakpoint: 1000,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          dots: true,
          swipe: true,
          arrows: false,
        },
      },
    ],
  }

  return (
    <div className="slider-container">
      <h2>{t('common.ourSpaces')}</h2>
      <div className="slider-wrapper">
        {loading ? (
          <div className="loading-spaces">Cargando espacios...</div>
        ) : (
          <Slider {...settings}>
            {spaces.map((space) => (
              <div key={space.id}>
                <SpaceCard {...space} />
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  )
}

export default SpacesCarousel
