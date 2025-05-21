import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { authenticatedFetch } from '../services/authService'
import { getPendingPayments, getUsers, getBookings, savePayment } from '../services/apiService'

import leonardo from '../assets/img/leonardo.svg'

const PendingPaymentList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    status: 'pending',
    payment_method: '',
    payment_date: '',
    user_reservation_id: '',
    space_reservation_id: '',
    reservation_period: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [payments, setPayments] = useState([])
  const [users, setUsers] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3

  // TODO: Organiza esto porfi
  const fetchPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getPendingPayments(currentPage, perPage);
      
      // Extract the payments array from the paginated response
      const paymentsArray = response?.data?.data || []
      setPayments(paymentsArray)
      
      // Set pagination data
      setTotalPages(response?.data?.last_page || 1)
    } catch (err) {
      setError(err.message || 'Error al obtener pagos pendientes')
    } finally {
      setLoading(false)
    }
  }
    const fetchUsers = async () => {
    try {
      const response = await getUsers();
      // Ensure we're working with an array
      const usersArray = response?.data?.data || response?.data || response || [];
      setUsers(usersArray);
    } catch (err) {
      // Error eliminado
    }
  }
  const fetchReservations = async () => {
    try {
      const response = await getBookings();
      
      // Ensure we're working with an array
      let reservationsArray = [];
      
      if (response?.data?.data && Array.isArray(response.data.data)) {
        reservationsArray = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        reservationsArray = response.data;
      } else if (Array.isArray(response)) {
        reservationsArray = response;
      }
      
      setReservations(reservationsArray); // Now we're sure this is an array
    } catch (err) {
      // Set an empty array as a fallback
      setReservations([]);
    }  }
  useEffect(() => {
    if (showList) {
      fetchPayments()
    }
  }, [showList, currentPage])

  useEffect(() => {
    fetchUsers()
    fetchReservations()
  }, [])

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
      const data = await savePayment(formData, editingId);

      if (data && data.success) {
        setEditingId(null)
        setErrors({})
        fetchPayments()
        setShowForm(false)
        setShowList(true)
      } else {
        setErrors(data.errors || {})
      }
    } catch (error) {
      // Error eliminado
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

  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id)
      const paymentToEdit = payments.find((payment) => payment.id === id)
      setFormData({
        user_id: paymentToEdit.user_id,
        amount: paymentToEdit.amount,
        status: paymentToEdit.status,
        payment_method: paymentToEdit.payment_method || '',
        payment_date: paymentToEdit.payment_date || '',
        user_reservation_id: paymentToEdit.user_reservation_id || '',
        space_reservation_id: paymentToEdit.space_reservation_id || '',
        reservation_period: paymentToEdit.reservation_period || '',
      })
    }
  }
  return (
    <>
      <h3>{t('links.pendingPayments')}</h3>
      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          {t('actions.paymentsRead')}
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          {t('actions.paymentsCreate')}
        </button>
      </div>
      {showList && (
        <section className="card__container">
          {loading && <p>{t('common.paymentsLoading')}</p>}
          {error && <p>{t('common.commonError', { error: error })}</p>}
          {!loading && !error && payments.length === 0 && (
            <p>{t('common.paymentsNoPayments')}</p>
          )}
          {!loading &&
            !error &&
            payments.map((payment) => (
              <React.Fragment key={payment.id}>
                <article className="card">
                  <div className="card__content">
                    <img
                      src={leonardo}
                      alt={t('alt.dashboardImg', { id: payment.id })}
                      title={t('common.dashboardImg', { id: payment.id })}
                      className="card__img"
                    />
                    <div className="card__text">
                      <p>
                        {payment.user?.name || 'Usuario'} - {payment.amount}€
                      </p>
                      <p>{t('common.status')}: {payment.status}</p>
                      <p>{payment.payment_method || t('common.paymentMethodUnknown')}</p>
                    </div>
                  </div>
                  <div className="card__buttons">
                    <button
                      className="form__submit --noArrow"
                      onClick={() => handleEditClick(payment.id)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button className="form__submit --noArrow">
                      {t('actions.delete')}
                    </button>
                  </div>
                </article>                {editingId === payment.id && (
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
                            <option key={user.id} value={user.id}>
                              {user.name} {user.surname} ({user.email})
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
                        <label htmlFor="amount">{t('form.amount.label')}</label>
                        <input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          placeholder={t('form.amount.placeholder')}
                          value={formData.amount}
                          onChange={handleChange}
                          required
                        />
                        {errors.amount &&
                          Array.isArray(errors.amount) &&
                          errors.amount.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="status">{t('form.status.label')}</label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          required
                        >
                          <option value="pending">{t('form.status.pending')}</option>
                          <option value="completed">{t('form.status.completed')}</option>
                        </select>
                        {errors.status &&
                          Array.isArray(errors.status) &&
                          errors.status.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="payment_method">{t('form.paymentMethod.label')}</label>
                        <select
                          id="payment_method"
                          name="payment_method"
                          value={formData.payment_method}
                          onChange={handleChange}
                        >
                          <option value="">{t('form.paymentMethod.placeholder')}</option>
                          <option value="credit_card">{t('form.paymentMethod.creditCard')}</option>
                          <option value="debit_card">{t('form.paymentMethod.debitCard')}</option>
                          <option value="cash">{t('form.paymentMethod.cash')}</option>
                          <option value="transfer">{t('form.paymentMethod.transfer')}</option>
                        </select>
                        {errors.payment_method &&
                          Array.isArray(errors.payment_method) &&
                          errors.payment_method.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="payment_date">{t('form.paymentDate.label')}</label>
                        <input
                          id="payment_date"
                          name="payment_date"
                          type="datetime-local"
                          placeholder={t('form.paymentDate.placeholder')}
                          value={formData.payment_date}
                          onChange={handleChange}
                        />
                        {errors.payment_date &&
                          Array.isArray(errors.payment_date) &&
                          errors.payment_date.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}                      </div>                      <div className="form__section">
                        <label htmlFor="reservation">{t('form.reservation.label')}</label>
                        <select
                          id="reservation"
                          name="reservation"
                          onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue) {
                              const parts = selectedValue.split('|');
                              if (parts.length >= 3) {
                                const user_id = parts[0];
                                const space_id = parts[1];
                                const period = parts.slice(2).join('|'); // Handle case where period might contain |
                                
                                setFormData(prev => ({
                                  ...prev,
                                  user_reservation_id: user_id,
                                  space_reservation_id: space_id,
                                  reservation_period: period
                                }));
                              }
                            }
                          }}
                          value={formData.user_reservation_id && formData.space_reservation_id && formData.reservation_period ? 
                            `${formData.user_reservation_id}|${formData.space_reservation_id}|${formData.reservation_period}` : ''}
                        >
                          <option value="">{t('form.reservation.placeholder')}</option>
                          {Array.isArray(reservations) && reservations.length > 0 ? reservations.map(reservation => (
                            <option 
                              key={`${reservation.user_id || ''}-${reservation.space_id || ''}-${reservation.reservation_period || ''}`} 
                              value={`${reservation.user_id || ''}|${reservation.space_id || ''}|${reservation.reservation_period || ''}`}
                            >
                              {reservation.user?.name || 'Usuario'} - {reservation.space?.subtitle || 'Espacio'} ({reservation.start_date || (reservation.reservation_period && reservation.reservation_period.split('|')[0]) || 'Fecha desconocida'})
                            </option>
                          )) : <option disabled>No hay reservas disponibles</option>}
                        </select>
                        {errors.reservation_period && 
                          Array.isArray(errors.reservation_period) &&
                          errors.reservation_period.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <input
                        type="submit"
                        value={t('actions.edit')}
                        className="form__submit"
                      />                    </form>
                  </article>                )}
              </React.Fragment>
            ))}
          {!loading && !error && payments.length > 0 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('common.previous')}
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
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
                      {user.name} {user.surname} ({user.email})
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
              </div>              <div className="form__section">
                <label htmlFor="amount">{t('form.amount.label')}</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder={t('form.amount.placeholder')}
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
                {errors.amount &&
                  Array.isArray(errors.amount) &&
                  errors.amount.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="status">{t('form.status.label')}</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="pending">{t('form.status.pending')}</option>
                  <option value="completed">{t('form.status.completed')}</option>
                </select>
                {errors.status &&
                  Array.isArray(errors.status) &&
                  errors.status.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>              <div className="form__section">
                <label htmlFor="payment_method">{t('form.paymentMethod.label')}</label>
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="">{t('form.paymentMethod.placeholder')}</option>
                  <option value="credit_card">{t('form.paymentMethod.creditCard')}</option>
                  <option value="debit_card">{t('form.paymentMethod.debitCard')}</option>
                  <option value="cash">{t('form.paymentMethod.cash')}</option>
                  <option value="transfer">{t('form.paymentMethod.transfer')}</option>
                </select>
                {errors.payment_method &&
                  Array.isArray(errors.payment_method) &&
                  errors.payment_method.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="payment_date">{t('form.paymentDate.label')}</label>
                <input
                  id="payment_date"
                  name="payment_date"
                  type="datetime-local"
                  placeholder={t('form.paymentDate.placeholder')}
                  value={formData.payment_date}
                  onChange={handleChange}
                />
                {errors.payment_date &&
                  Array.isArray(errors.payment_date) &&
                  errors.payment_date.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>              <div className="form__section">
                <label htmlFor="reservation">{t('form.reservation.label')}</label>
              <select
                  id="reservation"
                  name="reservation"
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue) {
                      const parts = selectedValue.split('|');
                      if (parts.length >= 3) {
                        const user_id = parts[0];
                        const space_id = parts[1];
                        const period = parts.slice(2).join('|'); // Handle case where period might contain |
                        
                        setFormData(prev => ({
                          ...prev,
                          user_reservation_id: user_id,
                          space_reservation_id: space_id,
                          reservation_period: period
                        }));
                      }
                    }
                  }}
                  value={formData.user_reservation_id && formData.space_reservation_id && formData.reservation_period ? 
                    `${formData.user_reservation_id}|${formData.space_reservation_id}|${formData.reservation_period}` : ''}
                  required
                >
                  <option value="">{t('form.reservation.placeholder')}</option>
                  {Array.isArray(reservations) && reservations.length > 0 ? reservations.map(reservation => (
                    <option 
                      key={`${reservation.user_id || ''}-${reservation.space_id || ''}-${reservation.reservation_period || ''}`} 
                      value={`${reservation.user_id || ''}|${reservation.space_id || ''}|${reservation.reservation_period || ''}`}
                    >
                      {reservation.user?.name || 'Usuario'} - {reservation.space?.subtitle || 'Espacio'} ({reservation.start_date || (reservation.reservation_period && reservation.reservation_period.split('|')[0]) || 'Fecha desconocida'})
                    </option>
                  )) : <option disabled>No hay reservas disponibles</option>}
                </select>
                {errors.reservation_period && 
                  Array.isArray(errors.reservation_period) &&
                  errors.reservation_period.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>              <input
                type="submit"
                value={t('actions.paymentsCreate')}
                className="form__submit"
              />
            </form>
          </article>
        </section>
      )}
    </>
  )
}

export default PendingPaymentList
