import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getUsers, saveUser } from '../services/apiService'

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

  // Función para obtener usuarios desde el servicio API
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      // Check if the data is paginated and extract the users from the "data" property
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setUsers(data.data) // Set only the users array from the paginated data
      } else {
        setUsers(data) // Fallback to the original behavior if data is not paginated
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
  }, [showList])

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
      const originalUser = editingId ? users.find(user => user.id === editingId) : null;
      
      // Usar el servicio API centralizado para guardar usuario
      const data = await saveUser(formData, editingId, originalUser);

      if (data && data.success) {
        if (editingId) {
          setEditingId(null)
          setError({})
          // Actualizar la lista de usuarios
          fetchUsers()
        }
      } else {
        setError(data.error || {})
      }
    } catch (error) {
      console.error(editingId ? 'Error al editar:' : 'Error al registrar:', error)
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

  const [editingId, setEditingId] = useState(null)
  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id)
      const userToEdit = users.find((user) => user.id === id)
      console.log('User to edit:', userToEdit) // Debug para ver el formato de los datos

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
                      <p>
                        {user.name} {user.surname}
                      </p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="card__buttons">
                    <button
                      className="form__submit --noArrow"
                      onClick={() => handleEditClick(user.id)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button className="form__submit --noArrow">
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
                        {error &&
                          error.name &&
                          Array.isArray(error.name) &&
                          error.name.map((err, idx) => (
                            <span className="form__error" key={idx}>
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
                        {error &&
                          error.surname &&
                          Array.isArray(error.surname) &&
                          error.surname.map((err, idx) => (
                            <span className="form__error" key={idx}>
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
                        {error &&
                          error.email &&
                          Array.isArray(error.email) &&
                          error.email.map((err, idx) => (
                            <span className="form__error" key={idx}>
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
                        {error &&
                          error.password &&
                          Array.isArray(error.password) &&
                          error.password.map((err, idx) => (
                            <span className="form__error" key={idx}>
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
                        {error &&
                          error.confirmPassword &&
                          Array.isArray(error.confirmPassword) &&
                          error.confirmPassword.map((err, idx) => (
                            <span className="form__error" key={idx}>
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
                {error &&
                  error.name &&
                  Array.isArray(error.name) &&
                  error.name.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.surname &&
                  Array.isArray(error.surname) &&
                  error.surname.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.birthdate &&
                  Array.isArray(error.birthdate) &&
                  error.birthdate.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.dni &&
                  Array.isArray(error.dni) &&
                  error.dni.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.email &&
                  Array.isArray(error.email) &&
                  error.email.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.password &&
                  Array.isArray(error.password) &&
                  error.password.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.confirmPassword &&
                  Array.isArray(error.confirmPassword) &&
                  error.confirmPassword.map((err, idx) => (
                    <span className="form__error" key={idx}>
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
                {error &&
                  error.termsAndConditions &&
                  Array.isArray(error.termsAndConditions) &&
                  error.termsAndConditions.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`error.${err}`)}
                    </span>
                  ))}
              </div>
              <input
                type="submit"
                value={t('actions.usersCreate')}
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
