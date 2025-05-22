import ContactUs from '../components/ContactUs'
import { useTranslation } from 'react-i18next'

import coworking from '../assets/img/coworking1.webp'
import peaspeas from '../assets/img/peaspeas.png'

const About = () => {
  const { t } = useTranslation()
  return (
    <>
      <section className="about__section">
        <h1 className="about__title">{t('links.about')}</h1>
        <div className="about__img-container">
          <img
            className="about__img"
            src={coworking}
            alt={t('about.coworking_space')}
          />
        </div>
      </section>
      <main className='main__about'>
        <h2>{t('sliders.title1')}</h2>
        <p>{t('sliders.msg1')} {t('sliders.msg2')}</p>
        <p>{t('sliders.msg3')} {t('sliders.msg4')}</p>
        <p>{t('sliders.msg5')} {t('sliders.msg6')}</p>
        <img className='about__peas' src={peaspeas} alt={t('alt.peaspeas')} title={t('common.peaspeas')} />
      </main>
      <ContactUs />
    </>
  )
}

export default About
