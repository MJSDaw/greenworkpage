import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ContactUs from '../components/ContactUs'
import { getSpaceById } from '../services/apiService'
import { useTranslation } from 'react-i18next'
import ServiceCard from '../components/ServiceCard'

import pc from '../assets/img/pc.svg'
import maps from '../assets/img/maps.svg'
import eur from '../assets/img/eur.svg'

const Space = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const [space, setSpace] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true)
        const response = await getSpaceById(id)
        if (response && response.data) {
          const spacesData = {
            src: `https://localhost:8443/storage/${response.data.images.split('|')[0]}`,
            subtitle: response.data.subtitle,
            amount: response.data.price,
            maps: response.data.address || '',
            seats: response.data.places,
            description: response.data.description,
          }
          setSpace(spacesData)
        }
      } catch (error) {
        console.error('Error al cargar espacios:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpace()
  }, [])

  return (
  <>
    <main className="terms__background--space">
      <section className="terms">
        <h1 className="h1--left">
          {t('form.space.label')} {space.subtitle}
        </h1>
        <article className="space__grid">
          <img
            src={space.src}
            alt={space.subtitle}
            className="space__img"
          />
          <div className="space__features">
            <h2>{t('common.features')}</h2>
            <div className="feature__item">
              <img src={pc} alt="Seats icon" />
              <span>{space.seats} {t('form.seats.label')}</span>
            </div>
            <div className="feature__item">
              <img src={maps} alt="Location icon" />
              <span>{space.maps}</span>
            </div>
            <div className="feature__item">
              <img src={eur} alt="Price icon" />
              <span>{space.amount} / {t('form.time.label')}</span>
            </div>
          </div>
        </article>
        <article className='space__services'>
          <ServiceCard src='' text='' />
          <ServiceCard />
          <ServiceCard />
          <ServiceCard />
          <ServiceCard />
          <ServiceCard />
          <ServiceCard />
        </article>
        <article className='space__description'>
          <h2>{t('form.description.label')}</h2>
          <p>{space.description}</p>
        </article>
      </section>
    </main>
    <ContactUs />
  </>
);
}

export default Space
