import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import pruebas from '../assets/img/pruebas.webp'
import leonardo from '../assets/img/leonardo.svg'

const ContactUs = () => {
  const { t } = useTranslation()
  return (
    <section className="contact__background">
      <h2 className="h1--left--up">{t('common.contactUs')}</h2>
      <article className="white__container--contact">
        <img src={pruebas} alt={t('alt.pruebas')} title={t('common.pruebas')} />
        <img src={pruebas} alt={t('alt.pruebas')} title={t('common.pruebas')} />
        <img src={pruebas} alt={t('alt.pruebas')} title={t('common.pruebas')} />
        <section className="white__container">
          <h3>{t('common.contact.title')}</h3>
          <p>{t('common.contact.msg1')}</p>
          <p>{t('common.contact.msg2')}</p>
          <form>
            <div className="form__section">
              <label htmlFor="name">{t('form.name.label')}</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder={t('form.name.placeholder')}
                required
              />
            </div>
            <div className="form__section">
              <label htmlFor="email">{t('form.email.label')}</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder={t('form.email.placeholder')}
                required
              />
            </div>
            <div className="form__section">
              <label htmlFor="message">{t('form.message.label')}</label>
              <textarea
                id="message"
                name="message"
                placeholder={t('form.message.placeholder')}
                required
              />
            </div>
            <label className="input--checkbox__label">
              <input
                className="input--checkbox"
                type="checkbox"
                name="termsAndConditions"
                required
              />
              <span className="input--checkbox__text">
                {t('form.checkbox.contact.msg1')}
                <Link
                  to="/terms"
                  className="input--checkbox__text--link"
                  title={t('actions.goToTerms')}
                >
                  {t('links.terms')}
                </Link>{' '}
                {t('form.checkbox.contact.msg2')}
                <Link
                  to="/privacy"
                  className="input--checkbox__text--link"
                  title={t('actions.goToPrivacy')}
                >
                  {t('links.privacy')}
                </Link>
              </span>
            </label>
            <input
              type="submit"
              value={t('common.contactUs')}
              className="form__submit"
            />
          </form>
        </section>
        <img
          src={leonardo}
          alt={t('alt.leonardo')}
          title={t('common.leonardo')}
          className="leonardo--overForm"
        />
      </article>
    </section>
  )
}

export default ContactUs
