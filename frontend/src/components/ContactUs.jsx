import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createContact } from '../services/apiService'

import greenwork1 from '../assets/img/greenwork1.webp'
import greenwork2 from '../assets/img/greenwork2.webp'
import greenwork3 from '../assets/img/greenwork3.webp'
import leonardo from '../assets/img/leonardo.svg'

const ContactUs = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    termsAndConditions: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleChange = (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await createContact({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        termsAndConditions: formData.termsAndConditions,
      })

      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        message: '',
        termsAndConditions: false,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="contact__background">
      <h2 className="h1--left--up">{t('common.contactUs')}</h2>
      <article className="white__container--contact">
        <img
          src={greenwork3}
          alt={t('alt.greenwork3')}
          title={t('common.greenwork3')}
        />
        <img
          src={greenwork1}
          alt={t('alt.greenwork1')}
          title={t('common.greenwork1')}
        />
        <img
          src={greenwork2}
          alt={t('alt.greenwork2')}
          title={t('common.greenwork2')}
        />
        <section className="white__container">
          <h3>{t('common.contact.title')}</h3>
          <p>{t('common.contact.msg1')}</p>
          <p>{t('common.contact.msg2')}</p>
          {submitSuccess ? (
            <div className="form__error">
              <p>{t('form.success')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form__section">
                <label htmlFor="name">{t('form.name.label')}</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('form.email.placeholder')}
                  required
                />
              </div>
              <div className="form__section">
                <label htmlFor="message">{t('form.message.label')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('form.message.placeholder')}
                  required
                />
              </div>
              <label className="input--checkbox__label">
                <input
                  className="input--checkbox"
                  type="checkbox"
                  name="termsAndConditions"
                  checked={formData.termsAndConditions}
                  onChange={handleChange}
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
                value={
                  isSubmitting ? t('form.submitting') : t('common.contactUs')
                }
                disabled={isSubmitting}
                className="form__submit"
              />
              {submitError && (
                <div className="form__error">
                  <p>{t('errors.wait24hours')}</p>
                </div>
              )}
            </form>
          )}
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
