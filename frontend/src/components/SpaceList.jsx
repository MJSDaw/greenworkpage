import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { setAuthToken, authenticatedFetch } from '../services/authService'

import leonardo from '../assets/img/leonardo.svg'

const SpaceList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    places: '',
    price: '',
    schedule: '',
    images: '',
    description: '',
    subtitle: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  const fetchSpaces = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authenticatedFetch('/api/spaces', {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Error al obtener los espacios')
      }
      const data = await response.json()
      // Check if the data is paginated and extract the spaces from the "data" property
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setSpaces(data.data) // Set only the spaces array from the paginated data
      } else {
        setSpaces(data) // Fallback to the original behavior if data is not paginated
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (showList) {
      fetchSpaces()
    }
  }, [showList])
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingId ? `/api/admin/spaces/${editingId}` : '/api/admin/spaces'
      const method = editingId ? 'PUT' : 'POST'

      const response = await authenticatedFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (data && data.status === 'success') {
        if (editingId) {
          setEditingId(null)
          setErrors({})
        } else {
          setErrors({})
          setShowForm(false)
          setShowList(true)
        }
        fetchSpaces() // Reload the spaces list
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
  // TODO: usalo para cargar el resto de atributos pertinentes
  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id)
      const spaceToEdit = spaces.find((space) => space.id === id)
      setFormData({
        places: spaceToEdit.places,
        price: spaceToEdit.price,
        schedule: spaceToEdit.schedule,
        images: spaceToEdit.images,
        description: spaceToEdit.description,
        subtitle: spaceToEdit.subtitle,
      })
    }
  }

  return (
    <>
      <h3>{t('links.spaces')}</h3>
      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          {t('actions.spacesRead')}
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          {t('actions.spacesCreate')}
        </button>
      </div>      
      {showList && (
        <section className="card__container">
          {loading && <p>{t('common.spacesLoading')}</p>}
          {error && <p>{t('common.commonError', { error: error })}</p>}
          {!loading && !error && spaces.length === 0 && (
            <p>{t('common.spacesNoSpaces')}</p>
          )}
          {!loading &&
            !error &&
            spaces.map((space) => (
              <React.Fragment key={space.id}>
                <article className="card">
                  <div className="card__content">
                    <img
                      src={leonardo}
                      alt={t('alt.dashboardImg', { id: space.id })}
                      title={t('common.dashboardImg', { id: space.id })}
                      className="card__img"
                    />
                    <div className="card__text">
                      <p>{space.subtitle}</p>
                      <p>{space.price}€ - {space.places} {t('common.places')}</p>
                      <p>{space.schedule}</p>
                    </div>
                  </div>
                  <div className="card__buttons">
                    <button
                      className="form__submit --noArrow"
                      onClick={() => handleEditClick(space.id)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button className="form__submit --noArrow">
                      {t('actions.delete')}
                    </button>
                  </div>
                </article>                {editingId === space.id && (
                  <article className="card--form--edit">
                    <form onSubmit={handleSubmit}>
                      <div className="form__section">
                        <label htmlFor="places">{t('form.places.label')}</label>
                        <input
                          id="places"
                          name="places"
                          type="number"
                          placeholder={t('form.places.placeholder')}
                          value={formData.places}
                          onChange={handleChange}
                          required
                        />
                        {errors.places &&
                          Array.isArray(errors.places) &&
                          errors.places.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="price">
                          {t('form.price.label')}
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          placeholder={t('form.price.placeholder')}
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                        {errors.price &&
                          Array.isArray(errors.price) &&
                          errors.price.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="schedule">
                          {t('form.schedule.label')}
                        </label>
                        <input
                          id="schedule"
                          name="schedule"
                          placeholder={t('form.schedule.placeholder')}
                          value={formData.schedule}
                          onChange={handleChange}
                          required
                        />
                        {errors.schedule &&
                          Array.isArray(errors.schedule) &&
                          errors.schedule.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="images">{t('form.images.label')}</label>
                        <input
                          id="images"
                          name="images"
                          placeholder={t('form.images.placeholder')}
                          value={formData.images}
                          onChange={handleChange}
                          required
                        />
                        {errors.images &&
                          Array.isArray(errors.images) &&
                          errors.images.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="description">{t('form.description.label')}</label>
                        <textarea
                          id="description"
                          name="description"
                          placeholder={t('form.description.placeholder')}
                          value={formData.description}
                          onChange={handleChange}
                          required
                        />
                        {errors.description &&
                          Array.isArray(errors.description) &&
                          errors.description.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                      <div className="form__section">
                        <label htmlFor="subtitle">
                          {t('form.subtitle.label')}
                        </label>
                        <input
                          id="subtitle"
                          name="subtitle"
                          placeholder={t('form.subtitle.placeholder')}
                          value={formData.subtitle}
                          onChange={handleChange}
                          required
                        />
                        {errors.subtitle &&
                          Array.isArray(errors.subtitle) &&
                          errors.subtitle.map((err, idx) => (
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
      )}      {showForm && (
        <section className="card__container--form">
          <article className="card--form">
            <form onSubmit={handleSubmit}>
              <div className="form__section">
                <label htmlFor="places">{t('form.places.label')}</label>
                <input
                  id="places"
                  name="places"
                  type="number"
                  placeholder={t('form.places.placeholder')}
                  value={formData.places}
                  onChange={handleChange}
                  required
                />
                {errors.places &&
                  Array.isArray(errors.places) &&
                  errors.places.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="price">{t('form.price.label')}</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder={t('form.price.placeholder')}
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                {errors.price &&
                  Array.isArray(errors.price) &&
                  errors.price.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="schedule">{t('form.schedule.label')}</label>
                <input
                  id="schedule"
                  name="schedule"
                  placeholder={t('form.schedule.placeholder')}
                  value={formData.schedule}
                  onChange={handleChange}
                  required
                />
                {errors.schedule &&
                  Array.isArray(errors.schedule) &&
                  errors.schedule.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="images">{t('form.images.label')}</label>
                <input
                  id="images"
                  name="images"
                  placeholder={t('form.images.placeholder')}
                  value={formData.images}
                  onChange={handleChange}
                  required
                />
                {errors.images &&
                  Array.isArray(errors.images) &&
                  errors.images.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="description">{t('form.description.label')}</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder={t('form.description.placeholder')}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
                {errors.description &&
                  Array.isArray(errors.description) &&
                  errors.description.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label htmlFor="subtitle">{t('form.subtitle.label')}</label>
                <input
                  id="subtitle"
                  name="subtitle"
                  placeholder={t('form.subtitle.placeholder')}
                  value={formData.subtitle}
                  onChange={handleChange}
                  required
                />
                {errors.subtitle &&
                  Array.isArray(errors.subtitle) &&
                  errors.subtitle.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <input
                type="submit"
                value={t('actions.spacesCreate')}
                className="form__submit"
              />
            </form>
          </article>
        </section>
      )}
    </>
  )
}

export default SpaceList
