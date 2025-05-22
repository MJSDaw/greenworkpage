import { useTranslation } from 'react-i18next'
import ContactUs from '../components/ContactUs'

import groupPeas from '../assets/img/groupPeas.png'
import groupPeasMobile from '../assets/img/groupPeasMobile.png'
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
          <article className="white__container--home home__content">
            <h1 className="home__title">{t('common.slogan')}</h1>
            <p className="home__text">{t('sliders.msg1')}</p>
          </article>
        </section>
      </main>
      <SpacesCarousel />
      <ContactUs />
    </>
  )
}

export default Home
