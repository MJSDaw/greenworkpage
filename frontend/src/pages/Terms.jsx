import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import pruebas from '../assets/img/pruebas.webp'
import pruebas2 from '../assets/img/pruebas2.webp'

const Terms = () => {
  const { t } = useTranslation()
  return (
    <>
      <main className="terms__background">
        <section className="terms">
          <h1 className="h1--left">{t('common.terms')}</h1>
          <article className="white__container--terms">
            <p>{t('terms.msg1')}</p>
            <p>{t('terms.msg2')}</p>
            <p>{t('terms.msg3')}</p>
            <p>{t('terms.msg4')}</p>
            <p>{t('terms.msg5')}</p>
            <h2>{t('terms.title1')}</h2>
            <p>{t('terms.msg6')}</p>
            <p>{t('terms.msg7')}</p>
            <p>{t('terms.msg8')}</p>
            <p>{t('terms.msg9')}</p>
            <p>{t('terms.msg10')}</p>
            <p>{t('terms.msg11')}</p>
            <p>{t('terms.msg12')}</p>
            <p>{t('terms.msg13')}</p>
            <p>{t('terms.msg14')}</p>
            <p>{t('terms.msg15')}</p>
            <p>{t('terms.msg16')}</p>
            <p>{t('terms.msg17')}</p>
            <h2>{t('terms.title2')}</h2>
            <p>{t('terms.msg18')}</p>
            <p>{t('terms.msg19')}</p>
            <p>{t('terms.msg20')}</p>
            <p>{t('terms.msg21')}</p>
            <h2>{t('terms.title3')}</h2>
            <p>{t('terms.msg22')}</p>
            <h2>{t('terms.title4')}</h2>
            <p>{t('terms.msg23')}</p>
            <p>{t('terms.msg24')}</p>
            <p>{t('terms.msg25')}</p>
            <p>{t('terms.msg26')}</p>
            <p>{t('terms.msg27')}</p>
            <p>{t('terms.msg28')}</p>
            <p>{t('terms.msg29')}</p>
            <h2>{t('terms.title5')}</h2>
            <p>{t('terms.msg30')}</p>
            <p>{t('terms.msg31')}</p>
            <p>{t('terms.msg32')}</p>
            <p>{t('terms.msg33')}</p>
            <p>{t('terms.msg34')}</p>
          </article>
        </section>
      </main>
      <section className="contact__background">
        <h2 className="h1--left--up">{t('common.contactUs')}</h2>
        <article className="white__container--contact">
          <img
            src={pruebas}
            alt={t('alt.pruebas')}
            title={t('common.pruebas')}
          />
          <img
            src={pruebas}
            alt={t('alt.pruebas')}
            title={t('common.pruebas')}
          />
          <img
            src={pruebas}
            alt={t('alt.pruebas')}
            title={t('common.pruebas')}
          />
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
        </article>
      </section>
    </>
  )
}

export default Terms
