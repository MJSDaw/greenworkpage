import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getBookings, getUsers, getSpaces, createBooking, updateBooking } from '../services/apiService'
import { authenticatedFetch } from '../services/authService'

import leonardo from '../assets/img/leonardo.svg'

const BookingList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    user_id: '',
    space_id: '',
    start_date: '',
    end_date: '',
  })
  
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getBookings()
      
      // Extract the bookings array from the paginated response
      const bookingsArray = response?.data?.data || []
      setBookings(bookingsArray)
    } catch (err) {
      setError(err.message || 'Error al obtener reservas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchBookings()
      // Fetch users and spaces for dropdowns
      fetchUsersAndSpaces()
    }
  }, [showList])
  const fetchUsersAndSpaces = async () => {
    try {
      const [usersData, spacesData] = await Promise.all([
        getUsers(),
        getSpaces()
      ])

      // Asegurarse de manejar tanto la respuesta paginada como la no paginada
      const usersList = usersData?.data?.data || usersData?.data || usersData || []
      const spacesList = spacesData?.data?.data || spacesData?.data || spacesData || []

      setUsers(usersList)
      setSpaces(spacesList)
    } catch (err) {
      setError(err.message)
    }
  }
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16).replace('T', ' ');
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Format dates before sending to API
      const formattedData = {
        ...formData,
        start_date: formatDateForAPI(formData.start_date),
        end_date: formatDateForAPI(formData.end_date)
      }

      const data = editingId 
        ? await updateBooking(editingId, formattedData)
        : await createBooking(formattedData)

      if (data && data.success) {
        if (editingId) {
          setEditingId(null)
          setErrors({})
        } else {
          setErrors({})
          setShowForm(false)
          setShowList(true)
        }
        fetchBookings() // Reload the bookings list
      } else {
        setErrors(data.errors || {})
      }
    } catch (error) {
      setErrors(error.errors || {})
    }
  }

  const handleShowForm = () => {
    setShowForm(true)
    setShowList(false)
  }

  const handleShowList = () => {
    setShowForm(false)
    setShowList(true)
  }

  const [editingId, setEditingId] = useState(null)
  // Function to handle clicking the edit button for a booking
  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id)
      const bookingToEdit = bookings.find((booking) => booking.id === id)
      setFormData({
        user_id: bookingToEdit.user_id,
        space_id: bookingToEdit.space_id,
        start_date: bookingToEdit.start_date || (bookingToEdit.reservation_period?.split('|')[0] || ''),
        end_date: bookingToEdit.end_date || (bookingToEdit.reservation_period?.split('|')[1] || ''),
      })
    }
  }

  return (
    <>
      <h3>{t('links.bookings')}</h3>
      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          {t('actions.bookingsRead')}
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          {t('actions.bookingsCreate')}
        </button>
      </div>      {showList && (
        <section className="card__container">
          {loading && <p>{t('common.bookingsLoading')}</p>}
          {error && <p>{t('common.commonError', { error: error })}</p>}
          {!loading && !error && bookings.length === 0 && (
            <p>{t('common.bookingsNoBookings')}</p>
          )}
          {!loading &&
            !error &&
            bookings.map((booking) => (
              <React.Fragment key={booking.id || `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`}>
                <article className="card">
                  <div className="card__content">
                    <div className="card__text">
                      <p>
                        {t('common.user')}: {booking.user?.name || booking.user_id}
                      </p>
                      <p>
                        {t('common.space')}: {booking.space?.subtitle || booking.space_id}
                      </p>
                      <p>
                        {t('common.period')}: {booking.start_date || booking.reservation_period?.split('|')[0]} - {booking.end_date || booking.reservation_period?.split('|')[1]}
                      </p>
                    </div>
                  </div>
                  <div className="card__buttons">
                    <button
                      className="form__submit --noArrow"
                      onClick={() => handleEditClick(booking.id || `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button className="form__submit --noArrow">
                      {t('actions.delete')}
                    </button>
                  </div>
                </article>                
                {editingId === (booking.id || `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`) && (
                  <article className="card--form--edit">
                    <form onSubmit={handleSubmit}>
                      <div className="form__section">
                        <label htmlFor="user_id">{t('form.user.label')}</label>
                        <select
                          id="user_id"
                          name="user_id"
                          value={formData.user_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('form.user.placeholder')}</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.email}
                            </option>
                          ))}
                        </select>
                        {errors.user_id &&
                          Array.isArray(errors.user_id) &&
                          errors.user_id.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="space_id">
                          {t('form.space.label')}
                        </label>
                        <select
                          id="space_id"
                          name="space_id"
                          value={formData.space_id}
                          onChange={handleChange}
                          required
                        >
                          <option value="">{t('form.space.placeholder')}</option>
                          {spaces.map(space => (
                            <option key={space.id} value={space.id}>
                              {space.subtitle} ({space.price}€ - {space.places} {t('common.places')})
                            </option>
                          ))}
                        </select>
                        {errors.space_id &&
                          Array.isArray(errors.space_id) &&
                          errors.space_id.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="start_date">
                          {t('form.startDate.label')}
                        </label>
                        <input
                          id="start_date"
                          name="start_date"
                          type="datetime-local"
                          placeholder={t('form.startDate.placeholder')}
                          value={formData.start_date}
                          onChange={handleChange}
                          required
                        />
                        {errors.start_date &&
                          Array.isArray(errors.start_date) &&
                          errors.start_date.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="end_date">{t('form.endDate.label')}</label>
                        <input
                          id="end_date"
                          name="end_date"
                          type="datetime-local"
                          placeholder={t('form.endDate.placeholder')}
                          value={formData.end_date}
                          onChange={handleChange}
                          required
                        />
                        {errors.end_date &&
                          Array.isArray(errors.end_date) &&
                          errors.end_date.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <input
                        type="submit"
                        value={t('actions.edit')}
                        className="form__submit"
                      />
                    </form>
                  </article>
                )}
              </React.Fragment>
            ))}
        </section>
      )}
      {showForm && (
        <section className="card__container--form">
          <article className="card--form">
            <form onSubmit={handleSubmit}>
              <div className="form__section">
                <label htmlFor="user_id">{t('form.user.label')}</label>
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('form.user.placeholder')}</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
                {errors.user_id &&
                  Array.isArray(errors.user_id) &&
                  errors.user_id.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="space_id">{t('form.space.label')}</label>
                <select
                  id="space_id"
                  name="space_id"
                  value={formData.space_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('form.space.placeholder')}</option>
                  {spaces.map(space => (
                    <option key={space.id} value={space.id}>
                      {space.subtitle} ({space.price}€ - {space.places} {t('common.places')})
                    </option>
                  ))}
                </select>
                {errors.space_id &&
                  Array.isArray(errors.space_id) &&
                  errors.space_id.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="start_date">{t('form.startDate.label')}</label>
                <input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  placeholder={t('form.startDate.placeholder')}
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
                {errors.start_date &&
                  Array.isArray(errors.start_date) &&
                  errors.start_date.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="end_date">{t('form.endDate.label')}</label>
                <input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  placeholder={t('form.endDate.placeholder')}
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
                {errors.end_date &&
                  Array.isArray(errors.end_date) &&
                  errors.end_date.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <input
                type="submit"
                value={t('actions.bookingsCreate')}
                className="form__submit"
              />
            </form>
          </article>
        </section>
      )}
    </>
  )
}

export default BookingList
