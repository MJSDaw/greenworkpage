import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import donatello from '../assets/img/donatello.svg'

const Signin = () => {
  const { t } = useTranslation()
  return (
    <main className="login__background">
      <section className="login__container">
        <img
          className="cheakpeas"
          src={donatello}
          alt={t('alt.donatello')}
          title={t('common.donatello')}
        />
        <h1>{t('actions.register')}</h1>
        <form>
          <div className="form__input">
            <label htmlFor="name">{t('form.name.label')}</label>
            <input
              id="name"
              name="name"
              placeholder={t('form.name.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="surname">{t('form.surname.label')}</label>
            <input
              id="surname"
              name="surname"
              placeholder={t('form.surname.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="birthday">{t('form.birthday.label')}</label>
            <input
              id="birthday"
              name="birthday"
              placeholder={t('form.birthday.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="nif">{t('form.nif.label')}</label>
            <input
              id="nif"
              name="nif"
              placeholder={t('form.nif.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="email">{t('form.email.label')}</label>
            <input
              id="email"
              name="email"
              placeholder={t('form.email.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="password">{t('form.password.label')}</label>
            <input
              id="password"
              name="password"
              placeholder={t('form.password.placeholder')}
            />
          </div>
          <div className="form__input">
            <label htmlFor="confirmPassword">
              {t('form.confirmPassword.label')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              placeholder={t('form.confirmPassword.placeholder')}
            />
          </div>
          <label className="checkbox__label">
            <input className="checkbox" type="checkbox" />
            <span className="checkbox__text">
              {t('form.checkbox.register.msg1')}
              <Link to="/terms" className="form__checkbox" title={t('actions.goToTerms')}>
                {t('links.terms')}
              </Link>{' '}
              {t('form.checkbox.register.msg2')}
              <Link to="/privacy" className="form__checkbox" title={t('actions.goToPrivacy')}>
                {t('links.privacy')}
              </Link>
            </span>
          </label>
          <span className="link__text">
            {t('form.span.msg1')}
            <Link to="/login" className="form__link">
              {t('actions.login')}
            </Link>
          </span>
          <input type="submit" value={t('actions.register')} className="form__submit" />
        </form>
      </section>
    </main>
  )
}

export default Signin
