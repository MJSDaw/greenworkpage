import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserData, getUserProfile } from '../services/authService'
import { updateUserImage, getUserBookings, createBooking, updateUserProfile } from '../services/apiService'
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
    const userData = getUserData()

    if (userData) {
      setUserName(userData.name || '')
      
      // Establece solo el ID del usuario inicialmente
      setFormData((prev) => ({ ...prev, user_id: userData.id }))

      if (userData.image) {
        const imageUrl = userData.image.startsWith('http')
          ? userData.image
          : `https://localhost:8443/storage/${userData.image}`
        setImage(imageUrl)
      }

      const fetchUserData = async () => {
        try {
          const updatedData = await getUserProfile()
          if (updatedData) {
            // Actualizar el formData con los datos del usuario
            setFormData((prev) => ({
              ...prev,
              id: updatedData.id,
              name: updatedData.name || '',
              surname: updatedData.surname || '',
              email: updatedData.email || '',
              // No incluimos la contraseña - debe estar vacía inicialmente
              // No incluimos el DNI ya que normalmente no se modifica
              // No incluimos la fecha de nacimiento ya que normalmente no se modifica
            }))
            
            // Actualiza la imagen si existe
            if (updatedData.image) {
              const imageUrl = updatedData.image.startsWith('http')
                ? updatedData.image
                : `https://localhost:8443/storage/${updatedData.image}`
              setImage(imageUrl)
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err)
        }
      }

      fetchUserData()
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

    const userData = getUserData()
    if (!userData?.id) return

    try {
      const data = await updateUserImage(userData.id, file)
      if (data?.success && data.data?.image) {
        const newImage = `https://localhost:8443/storage/${data.data.image}`
        setImage(newImage)

        const currentUserData = getUserData()
        if (currentUserData) {
          currentUserData.image = data.data.image
          localStorage.setItem('userData', JSON.stringify(currentUserData))
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
    setLoading(true)
    setError({})
    
    try {
      // Crear objeto con solo los campos que queremos actualizar
      const updateData = {
        id: formData.id,
        name: formData.name,
        surname: formData.surname,
        email: formData.email
      }
      
      // Si se proporcionó una contraseña, incluirla en la actualización
      if (formData.password) {
        // Verifica que la contraseña y su confirmación coincidan
        if (formData.password !== formData.passwordConfirm) {
          setError({ passwordConfirm: [t('error.passwordMismatchError') || 'Las contraseñas no coinciden'] })
          setLoading(false)
          return
        }
        updateData.password = formData.password
      }
      
      console.log('Sending update request with data:', updateData)
      const response = await updateUserProfile(updateData)
      console.log('Update response:', response)
      
      if (response && response.success) {
        // Actualizar los datos en localStorage
        const currentUserData = getUserData()
        if (currentUserData) {
          currentUserData.name = response.user.name
          currentUserData.surname = response.user.surname
          currentUserData.email = response.user.email
          localStorage.setItem('userData', JSON.stringify(currentUserData))
        }
        
        // Actualizar nombre de usuario en la interfaz
        setUserName(response.user.name || '')
        
        // Mostrar mensaje de éxito
        setBackupMessage(t('common.profileUpdateSuccess'))
        setShowBackupMessage(true)
        
        // Limpiar campos de contraseña
        setFormData((prev) => ({
          ...prev,
          password: '',
          passwordConfirm: ''
        }))
      } else {
        // Mostrar errores de validación
        setError(response?.errors || { general: [t('common.commonError')] })
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError({ form: [err.message || t('common.commonError')] })
    } finally {
      setLoading(false)
    }
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
        <h2>{t('common.dataModified')}</h2>        <section className="card__container">
          <article className="card--form--edit">
            {showBackupMessage && (
              <div className="message--success">
                <p>{backupMessage}</p>
              </div>
            )}
            {error?.form && (
              <div className="message--error">
                {Array.isArray(error.form) &&
                  error.form.map((err) => (
                    <p key={err}>{t(`error.${err}`) || err}</p>
                  ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {['name', 'surname', 'email'].map((field) => (
                <div className="form__section" key={field}>
                  <label htmlFor={`user-${field}`}>{t(`form.${field}.label`)}</label>
                  <input
                    id={`user-${field}`}
                    name={field}
                    placeholder={t(`form.${field}.placeholder`)}
                    value={formData[field] || ''}
                    onChange={handleChange}
                  />
                  {Array.isArray(error?.[field]) &&
                    error[field].map((err) => (
                      <span className="form__error" key={err}>
                        {t(`error.${err}`) || err}
                      </span>
                    ))}
                </div>
              ))}
              <div className="form__section">
                <label htmlFor="password">{t('form.password.label')}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('form.password.placeholder')}
                  value={formData.password || ''}
                  onChange={handleChange}
                />
                {Array.isArray(error?.password) &&
                  error.password.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`) || err}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="passwordConfirm">{t('form.confirmPassword.label')}</label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  placeholder={t('form.confirmPassword.placeholder')}
                  value={formData.passwordConfirm || ''}
                  onChange={handleChange}
                />
                {Array.isArray(error?.passwordConfirm) &&
                  error.passwordConfirm.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`) || err}
                    </span>
                  ))}
              </div>
              <input 
                type="submit" 
                value={loading ? t('common.loading', { defaultValue: 'Procesando...' }) : t('actions.edit')} 
                className="form__submit" 
                disabled={loading}
              />
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
