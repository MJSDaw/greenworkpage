import React, { useState, useEffect } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ContactUs from '../components/ContactUs'
import coworking1 from '../assets/img/coworking1.webp'
import coworking2 from '../assets/img/coworking2.webp'
import coworking3 from '../assets/img/coworking3.webp'
import { useTranslation } from 'react-i18next'
import SpaceCard from '../components/SpaceCard'
import { getSpaces, API_BASE_URL } from '../services/apiService'

const Spaces = () => {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1500)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const slides = [
    {
      id: 1,
      image: coworking1,
      title: t('sliders.title1'),
      description1: t('sliders.msg1'),
      description2: t('sliders.msg2'),
    },
    {
      id: 2,
      image: coworking2,
      title: t('sliders.title2'),
      description1: t('sliders.msg3'),
      description2: t('sliders.msg4'),
    },
    {
      id: 3,
      image: coworking3,
      title: t('sliders.title3'),
      description1: t('sliders.msg5'),
      description2: t('sliders.msg6'),
    },
  ]

  const styles = {
    box: {
      position: 'absolute',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
      textAlign: 'center',
      borderRadius: '1.5rem',
    },
    desktop: {
      left: '25%',
      padding: '3rem',
      maxWidth: '60rem',
      width: '80%',
    },
    mobile: {
      left: '50%',
      padding: '3rem',
      maxWidth: '90%',
      width: '85%',
    },
    bgBox: {
      position: 'relative',
      top: '-5rem',
      width: '102%',
      left: '-1rem',
    },
    bgPc: {
      top: '-5rem',
      width: '102%',
      left: '-1rem',
    },
    bgMb: {
      top: '-5rem',
      width: '106%',
      left: '-1rem',
    },
    gridBox: {
      display: 'grid',
      gap: '3rem',
      padding: '2rem',
      maxWidth: '100%',
      margin: '0 auto',
    },
    gridPc: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    gridMb: {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
    containerPc: {
      margin: '0 20rem',
    },
    containerMb: {
      margin: '0 2rem',
    },
  }

  const [spaces, setSpaces] = useState([])

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true)
        const response = await getSpaces(1, 0)
        if (response && response.data) {
          const spacesData = response.data.map((space) => ({
            id: space.id,
            src: `${API_BASE_URL}/storage/${space.images.split('|')[0]}`,
            subtitle: space.subtitle,
            amount: space.price,
            maps: space.address || '',
            seats: space.places,
            link: `/space/${space.id}`,
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


  return (
    <div style={{ overflowX: 'hidden' }}>
      <div
        style={{
          ...styles.bgBox,
          ...(isMobile ? styles.bgMb : styles.bgPc),
        }}
      >
        <Slider {...sliderSettings}>
          {slides.map((slide) => (
            <div key={slide.id}>
              <div
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '60rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    ...styles.box,
                    ...(isMobile ? styles.mobile : styles.desktop),
                  }}
                >
                  <h2 style={{ color: '#1C4624', marginBottom: '1.5rem' }}>
                    {slide.title}
                  </h2>
                  <p>
                    {slide.description1}
                    <br />
                    <br />
                    {slide.description2}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <section
        style={{
          ...styles.containerBox,
          ...(isMobile ? styles.containerMb : styles.containerPc),
        }}
      >
        <h1>{t('common.ourSpaces')}</h1>
        <article
          style={{
            ...styles.gridBox,
            ...(isMobile ? styles.gridMb : styles.gridPc),
          }}
        >
          {spaces.map((space) => (
            <div key={space.id}>
              <SpaceCard {...space} />
            </div>
          ))}
        </article>
      </section>
      <ContactUs />
    </div>
  )
}

export default Spaces
