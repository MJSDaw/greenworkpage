import React from 'react'
import { useTranslation } from 'react-i18next'
import ContactUs from '../components/ContactUs'

import search from '../assets/img/search.svg'
import groupPeas from '../assets/img/groupPeas.png'
import groupPeasMobile from '../assets/img/groupPeasMobile.png'
import SpaceCard from '../components/SpaceCard'
import SpacesCarousel from '../components/SpacesCarousel'

const Home = () => {
  const { t } = useTranslation()
  return (
    <>
    <main className="home">
      <section className="home__section">
        <img
          className="peas__group"
          src={groupPeas}
          alt={t('alt.groupPeas')}
          title={t('common.groupPeas')}
        />
        <img
          className="peas__group--mobile"
          src={groupPeasMobile}
          alt={t('alt.groupPeas')}
          title={t('common.groupPeas')}
        />
        <article className="white__container--home">
          <h1>{t('common.slogan')}</h1>
          <p>{t('common.proximity')}</p>
          <form>
            <div className="form__section">
              <label htmlFor="postalCode">{t('form.postalCode.label')}</label>
              <div className="form__section--icon">
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  placeholder={t('form.postalCode.placeholder')}
                />
                <button
                  type="submit"
                  className="icon--soft"
                >
                  <img
                    src={search}
                    alt={t('alt.search')}
                    className="icon__svg"
                    title={t('actions.search')}
                  />
                </button>
              </div>
            </div>
          </form>
        </article>
      </section>
    </main>
    <SpacesCarousel />
      <ContactUs />
      </>
  )
}

export default Home
