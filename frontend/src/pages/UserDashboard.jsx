import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserData, getUserProfile } from '../services/authService'
import { updateAdminImage, getUserBookings, createBooking } from '../services/apiService'
import defaultImage from '../assets/img/leonardo.svg'
import ContactUs from '../components/ContactUs'
import { isAuthenticated, getUserType } from '../services/authService'
import { useNavigate } from 'react-router-dom'

const UserDashboard = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    user_id: '',
    space_id: '', // Se puede setear desde la URL si se accede desde un espacio
    selected_date: '',
    start_time: '',
    end_time: '',
  })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [showBackupMessage, setShowBackupMessage] = useState(false)
  const [backupMessage, setBackupMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3
  const [showForm, setShowForm] = useState(false)
  const isUser = isAuthenticated() && getUserType() === 'user'

  useEffect(() => {
    const adminData = getUserData()

    if (adminData) {
      setUserName(adminData.name || '')
      setFormData((prev) => ({ ...prev, user_id: adminData.id }))

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
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUserBookings(currentPage, perPage)
      // Verificar y manejar la estructura de respuesta paginada
      if (response && response.data) {
        // Asegurarnos de obtener el array de reservas correctamente
        const bookingsArray = Array.isArray(response.data)
          ? response.data
          : (response.data.data || []);

        setBookings(bookingsArray)

        // Asegurarnos de obtener el número total de páginas
        const lastPage = response.data.last_page ||
          (response.last_page) ||
          Math.ceil((response.data.total || bookingsArray.length) / perPage) ||
          1;

        setTotalPages(lastPage)
      } else {
        setBookings([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error("Error obteniendo reservas:", err)
      setError(err.message || 'Error al obtener reservas')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentPage])

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

  const handleBookingChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    // Validación básica
    if (!formData.selected_date || !formData.start_time || !formData.end_time) {
      setError({ form: [t('common.allFieldsRequired')] })
      return
    }
    try {
      const bookingData = {
        user_id: formData.user_id,
        space_id: formData.space_id,
        start_time: `${formData.selected_date}T${formData.start_time}:00`,
        end_time: `${formData.selected_date}T${formData.end_time}:00`,
        status: 'pending',
      }
      const response = await createBooking(bookingData)
      if (response && response.success) {
        setShowForm(false)
        fetchBookings()
      } else {
        setError(response.errors || { form: [t('common.commonError')] })
      }
    } catch (err) {
      setError(err.errors || { form: [err.message] })
    }
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
                  <label htmlFor={`user-${field}`}>{t(`form.${field}.label`)}</label>
                  <input
                    id={`user-${field}`}
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
        {isUser && (
          <button
            className="form__submit"
            onClick={() => {
              navigate('/spaces');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {t('actions.bookingsCreate')}
          </button>
        )}
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

                <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} title={t('pagination.first', { defaultValue: 'Primera página' })}>«</button>
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} title={t('pagination.previous', { defaultValue: 'Página anterior' })}>‹</button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || bookings.length < perPage} title={t('pagination.next', { defaultValue: 'Página siguiente' })}>›</button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || bookings.length < perPage} title={t('pagination.last', { defaultValue: 'Última página' })}>»</button>
              </div>
            )}
        </section>
      </section>

      <ContactUs />
    </>
  )
}

export default UserDashboard
