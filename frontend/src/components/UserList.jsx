import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { setAuthToken, authenticatedFetch } from '../services/authService'

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
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Error al obtener los usuarios')
      }

      const data = await response.json()
      // Check if the data is paginated and extract the users from the "data" property
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setUsers(data.data) // Set only the users array from the paginated data
      } else {
        setUsers(data) // Fallback to the original behavior if data is not paginated
      }
    } catch (err) {
      setError(err.message)
      console.error('Error al obtener usuarios:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchUsers()
    }
  }, [showList])

  const [errors, setErrors] = useState({})

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
      const url = editingId ? `/api/users/${editingId}` : '/api/register'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      console.log(editingId ? 'Edit response:' : 'Registration response:', data)

      if (data && data.success) {
        if (editingId) {
          setEditingId(null)
          setErrors({})
          console.log('Usuario actualizado correctamente')
        } else {
          if (data.token) {
            setAuthToken(data.token, data.user)
            setErrors({})
            window.location.href = '/'
          } else {
            setErrors(data.errors || {})
            console.log('Token not saved. Response data structure:', data)
          }
        }
      } else {
        setErrors(data.errors || {})
      }
    } catch (error) {
      console.error(editingId ? 'Edit error:' : 'Registration error:', error)
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
      // Busca el usuario en tu lista y carga sus datos en el formulario
      const userToEdit = users.find((user) => user.id === id)
      setFormData({
        name: userToEdit.name,
        surname: userToEdit.surname,
        // ... otros campos
      })
    }
  }

  return (
    <>
      <h3>Usuarios</h3>

      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          Ver usuarios
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          Crear usuario
        </button>
      </div>
      {showList && (
        <section className="card__container">
          {loading && <p>Cargando usuarios...</p>}
          {error && <p>Error: {error}</p>}
          {!loading && !error && users.length === 0 && (
            <p>No hay usuarios disponibles</p>
          )}
          {!loading &&
            !error &&
            users.map((user) => (
              <React.Fragment key={user.id}>
                <article className="card">
                  <div className="card__content">
                    <img
                      src={leonardo}
                      alt={t('alt.dashboardImg')}
                      title={t('common.dashboardImg')}
                      className="card__img"
                    />
                  <div className="card__text">
                    <p>{user.name} {user.surname}</p>
                    <p>{user.email}</p>  
                  </div>
                </div>
                <div className="card__buttons">
                  <button
                    className="form__submit --noArrow"
                    onClick={() => handleEditClick(user.id)}
                  >
                    Editar
                  </button>
                  <button className="form__submit --noArrow">Eliminar</button>
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
                      <label htmlFor="birthdate">
                        {t('form.birthday.label')}
                      </label>
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
                    <input
                      type="submit"
                      value="Editar usuario"
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
                value="Crear usuario"
                className="form__submit"
              />
            </form>
          </article>
        </section>
      )}
    </>
  )
}

export default UserList
