import React from 'react'
import { useTranslation } from 'react-i18next'

import search from '../assets/img/search.svg'
import groupPeas from '../assets/img/groupPeas.png'
import groupPeasMobile from '../assets/img/groupPeasMobile.png'

const Home = () => {
  const { t } = useTranslation()
  return (
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
                  title={t('actions.search')}
                >
                  <img
                    src={search}
                    alt={t('alt.search')}
                    className="icon__svg"
                  />
                </button>
              </div>
            </div>
          </form>
        </article>
      </section>
      <section className="home__section--spaces">
        <h2>{t('common.ourSpaces')}</h2>
        <section className="home__section--spaces">
          <h2>{t('common.ourSpaces')}</h2>
        </section>
      </section>
      <section>
        <h2>{t('common.contactUs')}</h2>
      </section>
    </main>
  )
}

export default Home
