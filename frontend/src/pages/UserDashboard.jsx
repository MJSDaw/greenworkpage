import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserData, getUserProfile } from '../services/authService'
import { updateAdminImage } from '../services/apiService'
import defaultImage from '../assets/img/leonardo.svg'
import ContactUs from '../components/ContactUs'

const UserDashboard = () => {
  const { t } = useTranslation()
  const [userName, setUserName] = useState('')
  const [image, setImage] = useState(defaultImage)
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
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [showBackupMessage, setShowBackupMessage] = useState(false)
  const [backupMessage, setBackupMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const adminData = getUserData()

    if (adminData) {
      setUserName(adminData.name || '')

      if (adminData.image) {
        const imageUrl = adminData.image.startsWith('http')
          ? adminData.image
          : `https://localhost:8443/storage/${adminData.image}`
        setImage(imageUrl)
      }

      const fetchAdminData = async () => {
        try {
          const updatedData = await getUserProfile()
          if (updatedData?.image) {
            const imageUrl = updatedData.image.startsWith('http')
              ? updatedData.image
              : `https://localhost:8443/storage/${updatedData.image}`
            setImage(imageUrl)
          }
        } catch (err) {
          console.error('Error fetching admin data:', err)
        }
      }

      fetchAdminData()
    }
  }, [])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file || file.size > 2 * 1024 * 1024) return

    const url = URL.createObjectURL(file)
    setImage(url)

    const adminData = getUserData()
    if (!adminData?.id) return

    try {
      const data = await updateAdminImage(adminData.id, file)
      if (data?.success && data.data?.image) {
        const newImage = `https://localhost:8443/storage/${data.data.image}`
        setImage(newImage)

        const currentAdminData = getUserData()
        if (currentAdminData) {
          currentAdminData.image = data.data.image
          localStorage.setItem('userData', JSON.stringify(currentAdminData))
        }
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setBackupMessage(t('errors.imageUploadFailed') || 'Error uploading image.')
      setShowBackupMessage(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Aquí deberías enviar el formData al backend. Este ejemplo no lo incluye.
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const formatDate = (date) => new Date(date).toLocaleString()
  const getStatusDisplay = (status) => t(`status.${status}`, status)

  return (
    <>
      <section className="user__background">
        <article className="user__section">
          <div className="user__img__container">
            <img src={image} className="user__img" alt={t('alt.dashboardImg')} />
            <label className="user__edit__btn">
              {t('actions.editImg')}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <h1>{t('common.greetings', { name: userName || 'Usuario' })}</h1>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('common.dataModified')}</h2>
        <section className="card__container">
          <article className="card--form--edit">
            <form onSubmit={handleSubmit}>
              {['name', 'surname', 'email'].map((field) => (
                <div className="form__section" key={field}>
                  <label htmlFor={field}>{t(`form.${field}.label`)}</label>
                  <input
                    id={field}
                    name={field}
                    placeholder={t(`form.${field}.placeholder`)}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                  {Array.isArray(error?.[field]) &&
                    error[field].map((err) => (
                      <span className="form__error" key={err}>
                        {t(`error.${err}`)}
                      </span>
                    ))}
                </div>
              ))}
              {['password', 'confirmPassword'].map((field) => (
                <div className="form__section" key={field}>
                  <label htmlFor={field}>{t(`form.${field}.label`)}</label>
                  <input
                    id={field}
                    name={field}
                    type="password"
                    placeholder={t(`form.${field}.placeholder`)}
                    value={formData[field]}
                    onChange={handleChange}
                  />
                  {Array.isArray(error?.[field]) &&
                    error[field].map((err) => (
                      <span className="form__error" key={err}>
                        {t(`error.${err}`)}
                      </span>
                    ))}
                </div>
              ))}
              <input type="submit" value={t('actions.edit')} className="form__submit" />
            </form>
          </article>
        </section>
      </section>

      <section className="user__section--part">
        <h2>{t('links.bookings')}</h2>
        <section className="card__container">
          {loading && <p>{t('common.bookingsLoading')}</p>}
          {!loading && bookings.length === 0 && <p>{t('common.bookingsNoBookings')}</p>}
          {!loading &&
            bookings.map((booking) => (
              <article className="card" key={booking.id}>
                <div className="card__content">
                  <div className="card__text">
                    <p>
                      <span className="span--bold">{t('form.user.label')}: </span>
                      {booking.user?.name || booking.user_id}
                    </p>
                    <p>
                      <span className="span--bold">{t('form.space.label')}: </span>
                      {booking.space?.subtitle || booking.space_id}
                    </p>
                    <p>
                      <span className="span--bold">{t('form.period.label')}: </span>
                      {formatDate(booking.start_time)} - {formatDate(booking.end_time)}
                    </p>
                    <p>
                      <span className="span--bold">{t('form.status.label')}: </span>
                      {getStatusDisplay(booking.status)}
                    </p>
                    {booking.purpose && (
                      <p>
                        <span className="span--bold">{t('form.purpose.label')}: </span>
                        {booking.purpose}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}

          {bookings.length > 0 && (
            <div className="pagination">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</button>
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
              <span>{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</button>
            </div>
          )}
        </section>
      </section>

      <ContactUs />
    </>
  )
}

export default UserDashboard
