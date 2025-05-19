import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import miguelangel from '../assets/img/miguelAngel.svg'
import { setAuthToken, isAuthenticated, getUserType } from '../services/authService'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/"); 
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      console.log('Login response:', data)
      if (data && data.success && data.token) {
        setAuthToken(data.token, data.user, data.user_type)
        setErrors({})
        console.log('Token saved:', data.token)
        console.log('User type:', data.user_type)        // Redirect based on user type
        if (data.user_type === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/' // Redirección a home para usuarios normales
        }
      } else {
        setErrors(data.errors || {})
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <main className="login__background--login">
      <section className="white__container">
        <img
          className="peas--miguelAngel"
          src={miguelangel}
          alt={t('alt.miguelangel')}
          title={t('common.miguelangel')}
        />
        <h1>{t('actions.login')}</h1>
        <form onSubmit={handleSubmit}>
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
            {errors.password && (
              <span className="form__error">{errors.password[0]}</span>
            )}
          </div>
          <Link to="/signin" className="form__span">
            <span>{t('form.span.msg2')}</span>
            {t('actions.register')}
          </Link>
          <input
            type="submit"
            value={t('actions.login')}
            className="form__submit"
          />
          {errors.auth &&
              Array.isArray(errors.auth) &&
              errors.auth.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {t(`errors.${err}`)}
                </span>
              ))}
        </form>
      </section>
    </main>
  )
}

export default Login
