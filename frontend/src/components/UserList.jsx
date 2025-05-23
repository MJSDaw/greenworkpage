import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { saveUser, deleteUser, API_BASE_URL } from '../services/apiService'
import { getAuthHeader } from '../services/authService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

import leonardo from '../assets/img/leonardo.svg'

const UserList = () => {
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

  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const perPage = 3
  // Función para obtener usuarios desde el servicio API
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users?page=${currentPage}&per_page=${perPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Añadir el token de autenticación si es necesario
            ...(getAuthHeader && getAuthHeader()),
          },
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener los usuarios')
      }

      const data = await response.json()

      if (data && typeof data === 'object') {
        setUsers(data.data || []) // Los usuarios están en la propiedad data
        setTotalPages(data.last_page || 1)
        setTotalItems(data.total || 0)
      } else {
        setUsers([])
        setTotalPages(1)
        setTotalItems(0)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (showList) {
      fetchUsers()
    }
  }, [showList, currentPage])

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
      // Si estamos editando, obtener el usuario original para comparación
      const originalUser = editingId
        ? users.find((user) => user.id === editingId)
        : null

      // Usar el servicio API centralizado para guardar usuario
      const data = await saveUser(formData, editingId, originalUser)

      if (data?.success) {
        if (editingId) {
          setEditingId(null)
          setError({})
          // Actualizar la lista de usuarios
          fetchUsers()
        }
        handleShowList()
      } else {
        setError(data?.error || {})
      }
    } catch (error) {
      setError({ general: error.message })
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
  const handleDelete = async (id) => {
    if (window.confirm(t('actions.deleteConfirm'))) {
      try {
        setLoading(true)
        const response = await deleteUser(id)
        // If deletion successful, refresh the user list
        if (response?.success) {
          await fetchUsers() // Refresh the list after successful deletion
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        setError(`${t('actions.deleteError')}: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const [editingId, setEditingId] = useState(null)
  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id)
      const userToEdit = users.find((user) => user.id === id)

      // Format birthdate if it exists
      let formattedBirthdate = ''
      if (userToEdit.birthdate) {
        // Ensure the date is in YYYY-MM-DD format for input[type="date"]
        const birthdate = new Date(userToEdit.birthdate)
        if (!isNaN(birthdate.getTime())) {
          formattedBirthdate = birthdate.toISOString().split('T')[0]
        }
      }

      setFormData({
        name: userToEdit.name || '',
        surname: userToEdit.surname || '',
        birthdate: formattedBirthdate,
        dni: userToEdit.dni || '',
        email: userToEdit.email || '',
        password: '',
        passwordConfirm: '',
        termsAndConditions: true,
      })
    }
  }

  return (
    <>
      <h3>{t('links.users')}</h3>
      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          {t('actions.usersRead')}
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          {t('actions.usersCreate')}
        </button>
      </div>
      {showList && (
        <>
          <section className="card__container">
            {loading && <p>{t('common.userLoading')}</p>}
            {error && <p>{t('common.commonError', { error: error })}</p>}
            {!loading && !error && users.length === 0 && (
              <p>{t('common.userNoUsers')}</p>
            )}
            {!loading &&
              !error &&
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <article className="card">
                    <div className="card__content">
                      <img
                        src={leonardo}
                        alt={t('alt.dashboardImg', { id: user.id })}
                        title={t('common.dashboardImg', { id: user.id })}
                        className="card__img"
                      />
                      <div className="card__text">
                        <p><span className='span--bold'>{t('form.name.label')}: </span>{user.name} {user.surname}</p>
                        <p><span className='span--bold'>{t('form.email.label')}: </span>{user.email}</p>
                      </div>
                    </div>
                    <div className="card__buttons">
                      <button
                        className="form__submit --noArrow"
                        onClick={() => handleEditClick(user.id)}
                      >
                        {t('actions.edit')}
                      </button>
                      <button className="form__submit --noArrow" onClick={() => handleDelete(user.id)}>
                        {t('actions.delete')}
                      </button>
                    </div>
                  </article>

                  {editingId === user.id && (
                    <article className="card--form--edit">
                      <form onSubmit={handleSubmit}>
                        <div className="form__section">
                          <label htmlFor="name">{t('form.name.label')}</label>
                          <input
                            id="name"
                            name="name"
                            placeholder={t('form.name.placeholder')}
                            value={formData.name}
                            onChange={handleChange}
                          />
                          {Array.isArray(error?.name) &&
                            error.name.map((err, idx) => (
                              <span className="form__error" key={err}>
                                {t(`error.${err}`)}
                              </span>
                            ))}
                        </div>
                        <div className="form__section">
                          <label htmlFor="surname">
                            {t('form.surname.label')}
                          </label>
                          <input
                            id="surname"
                            name="surname"
                            placeholder={t('form.surname.placeholder')}
                            value={formData.surname}
                            onChange={handleChange}
                          />
                          {Array.isArray(error?.surname) &&
                            error.surname.map((err) => (
                              <span className="form__error" key={err}>
                                {t(`error.${err}`)}
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
                          />
                          {Array.isArray(error?.email) &&
                            error.email.map((err) => (
                              <span className="form__error" key={err}>
                                {t(`error.${err}`)}
                              </span>
                            ))}
                        </div>
                        <div className="form__section">
                          <label htmlFor="password">
                            {t('form.password.label')}
                          </label>
                          <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder={t('form.password.placeholder')}
                            value={formData.password}
                            onChange={handleChange}
                          />
                          {Array.isArray(error?.password) &&
                            error.password.map((err) => (
                              <span className="form__error" key={err}>
                                {t(`error.${err}`)}
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
                          />
                          {Array.isArray(error?.confirmPassword) &&
                            error.confirmPassword.map((err) => (
                              <span className="form__error" key={err}>
                                {t(`error.${err}`)}
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
          {!loading && !error && users.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => 1)}
                disabled={currentPage === 1}
              >
                <img alt={t('alt.arrow')} title={t('common.arrow')} src={arrowTopito} className="arrowTopito--left" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <img alt={t('alt.arrow')} title={t('common.arrow')} src={arrow} className="arrow--left" />
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <img alt={t('alt.arrow')} title={t('common.arrow')} src={arrow} className="arrow--right" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => totalPages)}
                disabled={currentPage === totalPages}
              >
                <img alt={t('alt.arrow')} title={t('common.arrow')} src={arrowTopito} className="arrowTopito--right" />
              </button>
            </div>
          )}
        </>
      )}

      {showForm && (
        <section className="card__container--form">
          <article className="card--form">
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
                {Array.isArray(error?.name) &&
                  error.name.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.surname) &&
                  error.surname.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.birthdate) &&
                  error.birthdate.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.dni) &&
                  error.dni.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.email) &&
                  error.email.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.password) &&
                  error.password.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.confirmPassword) &&
                  error.confirmPassword.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
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
                {Array.isArray(error?.termsAndConditions) &&
                  error.termsAndConditions.map((err) => (
                    <span className="form__error" key={err}>
                      {t(`error.${err}`)}
                    </span>
                  ))}
              </div>
              <input
                type="submit"
                value={t('actions.usersCreate')}
                className="form__submit"
              />
            </form>{' '}
          </article>
        </section>
      )}
    </>
  )
}

export default UserList
