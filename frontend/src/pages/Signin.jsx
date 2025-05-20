import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import donatello from '../assets/img/donatello.svg'
import { setAuthToken, isAuthenticated } from '../services/authService'
import { register } from '../services/apiService'

const Signin = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

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

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/')
    }
  }, [navigate])

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
      const data = await register(formData)
      console.log('Registration response:', data)

      if (data && data.success && data.token) {
        setAuthToken(data.token, data.user, 'user')
        setErrors({})
        window.location.href = '/user'
      } else {
        setErrors(data.errors || {})
        console.log('Token not saved. Response data structure:', data)
      }
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

  return (
    <main className="register__background">
      <section className="white__container">
        <img
          className="peas--donatello"
          src={donatello}
          alt={t('alt.donatello')}
          title={t('common.donatello')}
        />
        <h1>{t('actions.register')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form__section">
            <label htmlFor="name">{t('form.name.label')}</label>
            <input
              id="name"
              name="name"
              placeholder={t('form.name.placeholder')}
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name &&
              Array.isArray(errors.name) &&
              errors.name.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
            <label htmlFor="surname">{t('form.surname.label')}</label>
            <input
              id="surname"
              name="surname"
              placeholder={t('form.surname.placeholder')}
              value={formData.surname}
              onChange={handleChange}
              required
            />
            {errors.surname &&
              Array.isArray(errors.surname) &&
              errors.surname.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
            <label htmlFor="birthdate">{t('form.birthday.label')}</label>
            <input
              id="birthdate"
              name="birthdate"
              placeholder={t('form.birthday.placeholder')}
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
            {errors.birthdate &&
              Array.isArray(errors.birthdate) &&
              errors.birthdate.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
            <label htmlFor="nif">{t('form.nif.label')}</label>
            <input
              id="nif"
              name="dni"
              placeholder={t('form.nif.placeholder')}
              value={formData.dni}
              onChange={handleChange}
              required
            />
            {errors.dni &&
              Array.isArray(errors.dni) &&
              errors.dni.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
            <label htmlFor="email">{t('form.email.label')}</label>
            <input
              id="email"
              name="email"
              placeholder={t('form.email.placeholder')}
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email &&
              Array.isArray(errors.email) &&
              errors.email.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
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
            {errors.password &&
              Array.isArray(errors.password) &&
              errors.password.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
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
            {errors.confirmPassword &&
              Array.isArray(errors.confirmPassword) &&
              errors.confirmPassword.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
          <div className="form__section">
            <label className="input--checkbox__label">
              <input
                className="input--checkbox"
                type="checkbox"
                name="termsAndConditions"
                checked={formData.termsAndConditions}
                onChange={handleTermsChange}
                required
              />
              <span className="input--checkbox__text">
                {t('form.checkbox.register.msg1')}
                <Link
                  to="/terms"
                  className="input--checkbox__text--link"
                  title={t('actions.goToTerms')}
                >
                  {t('links.terms')}
                </Link>{' '}
                {t('form.checkbox.register.msg2')}
                <Link
                  to="/privacy"
                  className="input--checkbox__text--link"
                  title={t('actions.goToPrivacy')}
                >
                  {t('links.privacy')}
                </Link>
              </span>
            </label>
            <Link to="/login" className="form__span">
              <span>{t('form.span.msg1')}</span>
              {t('actions.login')}
            </Link>
            {errors.termsAndConditions &&
              Array.isArray(errors.termsAndConditions) &&
              errors.termsAndConditions.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
          </div>
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
