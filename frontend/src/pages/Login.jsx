import React, { useState } from 'react'
import { data, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import miguelangel from '../assets/img/miguelAngel.svg'
import { setAuthToken } from '../services/authService'

const Login = () => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prevData) => ({
      ...prevData,
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
    <main className="login__background--login">
      <section className="login__container">
        <img
          className="peas--miguelAngel"
          src={miguelangel}
          alt={t('alt.miguelangel')}
          title={t('common.miguelangel')}
        />
        <h1>{t('actions.login')}</h1>
        <form onSubmit={handleSubmit}>
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
            {errors.password_confirm && (
              <span className="form__error">{errors.password_confirm[0]}</span>
            )}
          </div>
          <span className="link__text">
            {t('form.span.msg2')}
            <Link to="/login" className="form__link">
              {t('actions.register')}
            </Link>
          </span>
          <input
            type="submit"
            value={t('actions.login')}
            className="form__submit"
          />
        </form>
      </section>
    </main>
  )
}

export default Login
