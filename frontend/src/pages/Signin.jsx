import React, { useState } from 'react'
import { data, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import donatello from '../assets/img/donatello.svg'
import { setAuthToken } from '../services/authService'

const Signin = () => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthdate: '',
    dni: '',
    email: '',
    password: '',
    passwordConfirm: '',
    termsAndConditions: false,
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleTermsChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      termsAndConditions: e.target.checked,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('https://localhost:8443/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      console.log('Registration response:', data)

      if (data && data.success && data.token) {
        setAuthToken(data.token, data.user)
        // Redirect
        setErrors({})
      } else {
        setErrors(data.errors || {})
        console.log('Token not saved. Response data structure:', data)
      }
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <main className="login__background">
      <section className="login__container">
        <img
          className="peas"
          src={donatello}
          alt={t('alt.donatello')}
          title={t('common.donatello')}
        />
        <h1>{t('actions.register')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form__input">
            <label htmlFor="name">{t('form.name.label')}</label>
            <input
              id="name"
              name="name"
              placeholder={t('form.name.placeholder')}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="surname">{t('form.surname.label')}</label>
            <input
              id="surname"
              name="surname"
              placeholder={t('form.surname.placeholder')}
              value={formData.surname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="birthday">{t('form.birthday.label')}</label>
            <input
              id="birthday"
              name="birthdate"
              placeholder={t('form.birthday.placeholder')}
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="nif">{t('form.nif.label')}</label>
            <input
              id="nif"
              name="dni"
              placeholder={t('form.nif.placeholder')}
              value={formData.dni}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="email">{t('form.email.label')}</label>
            <input
              id="email"
              name="email"
              placeholder={t('form.email.placeholder')}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="password">{t('form.password.label')}</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder={t('form.password.placeholder')}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form__input">
            <label htmlFor="confirmPassword">
              {t('form.confirmPassword.label')}
            </label>
            <input
              id="confirmPassword"
              name="passwordConfirm"
              type="password"
              placeholder={t('form.confirmPassword.placeholder')}
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
            {errors.passwordConfirm && (
              <span className="form__error">{errors.passwordConfirm[0]}</span>
            )}
          </div>
          <div className="form__input"></div>
          <label className="checkbox__label">
            <input
              className="checkbox"
              type="checkbox"
              name="termsAndConditions"
              checked={formData.termsAndConditions}
              onChange={handleTermsChange}
              required
            />
            <span className="checkbox__text">
              {t('form.checkbox.register.msg1')}
              <Link
                to="/terms"
                className="form__checkbox"
                title={t('actions.goToTerms')}
              >
                {t('links.terms')}
              </Link>{' '}
              {t('form.checkbox.register.msg2')}
              <Link
                to="/privacy"
                className="form__checkbox"
                title={t('actions.goToPrivacy')}
              >
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
          <input
            type="submit"
            value={t('actions.register')}
            className="form__submit"
          />
        </form>
      </section>
    </main>
  )
}

export default Signin
