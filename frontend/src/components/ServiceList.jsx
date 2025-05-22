import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

const ServiceList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
  })

  // State for handling individual image uploads
  const [imageForm, setImageForm] = useState({
    file: null,
    fileName: '',
  })

  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3
  const fetchServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getServices(currentPage, perPage)
      console.log('Services response:', response) // Para debug
      if (response && response.status === 'success') {
        setServices(response.data || [])
        setTotalPages(response.meta.last_page || 1)
        setCurrentPage(response.meta.current_page || 1)
      } else {
        throw new Error('Formato de respuesta inválido')
      }
    } catch (err) {
      setError(err.message || 'Error al obtener servicios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchServices()
    }
  }, [showList, currentPage])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear the error for this field when the user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageForm({
        file: file,
        fileName: file.name,
      })

      // Read and display the image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image_url: reader.result, // This will be used only for preview
        })
      }
      reader.readAsDataURL(file)
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validate the form
    let formErrors = {}
    if (!formData.name.trim()) {
      formErrors.name = t('validation.required', {
        field: t('form.name.label'),
      })
    }

    // Check for image when creating new service
    if (!imageForm.file && !editingId) {
      formErrors.image = t('validation.required', {
        field: t('form.image.label'),
      })
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setLoading(true)
    try {
      // Create FormData for sending both the image file and other data
      const serviceData = new FormData()

      // Always append name
      if (formData.name.trim()) {
        serviceData.append('name', formData.name.trim())
      }

      // Always append image if we have one
      if (imageForm.file) {
        serviceData.append('image', imageForm.file)
      }
      if (editingId) {
        await updateService(editingId, serviceData, true) // true para indicar que es FormData
      } else {
        await createService(serviceData, true) // true para indicar que es FormData
      }

      // Reset form and state
      setFormData({
        name: '',
        image_url: '',
      })
      setImageForm({
        file: null,
        fileName: '',
      })
      setShowForm(false)
      setShowList(true)
      setEditingId(null)

      // Fetch updated list of services
      fetchServices()
    } catch (err) {
      setError(err.message || 'Error al guardar el servicio')
    } finally {
      setLoading(false)
    }
  }

  const handleShowForm = () => {
    setShowForm(true)
    setShowList(false)
    setError(null)
    setErrors({})
    // Reset form data
    setFormData({
      name: '',
      image_url: '',
    })
    setImageForm({
      file: null,
      fileName: '',
    })
    setEditingId(null)
  }

  const handleShowList = () => {
    setShowList(true)
    setShowForm(false)
    setError(null)
    setErrors({})
    setEditingId(null)
  }

  const [editingId, setEditingId] = useState(null)
  const handleEditClick = (id) => {
    const serviceToEdit = services.find((service) => service.id === id)
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name,
        image_url: serviceToEdit.image_url,
      })
      setShowForm(true)
      setShowList(false)
      setEditingId(id)
    }
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm(t('common.deleteConfirmation'))) {
      setLoading(true)
      try {
        await deleteService(id)
        // Refresh the services list
        fetchServices()
      } catch (err) {
        setError(err.message || 'Error al eliminar el servicio')
      } finally {
        setLoading(false)
      }
    }
  }
  return (
    <>
      <h3>{t('links.services')}</h3>
      <div className="user__buttons">
        <button className="form__submit --noArrow" onClick={handleShowList}>
          {t('actions.servicesRead')}
        </button>
        <button className="form__submit --noArrow" onClick={handleShowForm}>
          {t('actions.servicesCreate')}
        </button>
      </div>
      {showList && (
        <>
          <section className="card__container">
            {loading && <p>{t('common.servicesLoading')}</p>}
            {error && <p>{t('common.commonError', { error: error })}</p>}
            {!loading && !error && services.length === 0 && (
              <p>{t('common.servicesNoServices')}</p>
            )}
            {!loading &&
              !error &&
              services.map((service) => (
                <article className="card" key={service.id}>
                  <div className="card__content">
                    <div className="card__image">
                      {service.image_url && (
                        <img
                          src={`https://localhost:8443/storage/${service.image_url}`}
                          alt={service.name}
                        />
                      )}
                    </div>
                    <div className="card__text">
                      <p>
                        <span className="span--bold">{t('form.name.label')}: </span>
                        {service.name}
                      </p>
                    </div>
                    <div className="card__actions">
                      <button
                        className="button button--small"
                        onClick={() => handleEditClick(service.id)}
                      >
                        {t('buttons.edit')}
                      </button>
                      <button
                        className="button button--small button--danger"
                        onClick={() => handleDeleteClick(service.id)}
                      >
                        {t('buttons.delete')}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </section>
          {!loading && !error && services.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => 1)}
                disabled={currentPage === 1}
              >
                <img src={arrowTopito} className="arrowTopito--left" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <img src={arrow} className="arrow--left" />
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
                <img src={arrow} className="arrow--right" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => totalPages)}
                disabled={currentPage === totalPages}
              >
                <img src={arrowTopito} className="arrowTopito--right" />
              </button>
            </div>
          )}
        </>
      )}{' '}
      {showForm && (
        <div className="admin__container">
          <h4>
            {editingId ? t('common.editService') : t('common.addService')}
          </h4>
          <form onSubmit={handleSubmit} className="form">
            <div className="form__group">
              <label htmlFor="name">{t('form.name.label')}:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input--error' : ''}
              />
              {errors.name && (
                <p className="error-message">{errors.name}</p>
              )}
            </div>
            <div className="form__group">
              <label htmlFor="image">{t('form.image.label')}:</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={errors.image ? 'input--error' : ''}
              />
              {errors.image && <p className="error-message">{errors.image}</p>}
            </div>
            {formData.image_url && (
              <div className="form__group">
                <div className="image-preview">
                  <img
                    src={formData.image_url.startsWith('data:') 
                      ? formData.image_url  // Si es un data URL (imagen local)
                      : `https://localhost:8443/storage/${formData.image_url}`} // Si es una ruta del servidor
                    alt={t('form.imagePreview.alt')}
                  />
                </div>
              </div>
            )}

            <div className="form__group">
              <button type="submit" className="button" disabled={loading}>
                {loading ? t('buttons.saving') : t('buttons.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default ServiceList
