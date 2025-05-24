import ContactUs from '../components/ContactUs'
import { useTranslation } from 'react-i18next'

import maps from '../assets/img/maps.svg'
import phone from '../assets/img/phone.svg'

const Contact = () => {
  const { t } = useTranslation()
  return (
    <>
      <main className="contact__background--page">
        <section className="terms">
          <h1 className="h1--left">{t('common.maps')}</h1>
          <div className="contact__grid">
            <div className="maps__container">
              <iframe
                className="maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3521.899629222197!2d-15.412880423709293!3d28.02754341129492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc40962b2db3e805%3A0x5542fa9d1ac432a3!2sIes%20Fernando%20Sagaseta!5e0!3m2!1ses!2ses!4v1747943816746!5m2!1ses!2ses"
                title="Google Maps"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="space__features--contact">
              <div className="feature__item">
                <img src={maps} alt={t('alt.location')} title={t('common.location')} />
                <span>Ies Fernando Sagaseta 35220, Las Palmas</span>
              </div>
              <div className="feature__item">
                <img src={phone} alt={t('alt.phone')} title={t('common.phone')} />
                <span>+34 928 59 92 69</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ContactUs />
    </>
  )
}

export default Contact