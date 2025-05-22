import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSpaces, saveSpace, getServices, deleteSpace } from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

const SpaceList = () => {
  const { t } = useTranslation()
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

  const [scheduleEntries, setScheduleEntries] = useState([])
  const [scheduleForm, setScheduleForm] = useState({
    day: 'monday',
    startTime: '',
    endTime: '',
  })
  const [formData, setFormData] = useState({
    places: '',
    price: '',
    schedule: '',
    images: '',
    description: '',
    subtitle: '',
    address: '',
  })

  // Nuevo estado para manejar las imágenes individuales
  const [imageEntries, setImageEntries] = useState([])
  const [imageForm, setImageForm] = useState({
    file: null,
    fileName: '',
  })
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3
  const [services, setServices] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const fetchSpaces = async (page = currentPage) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getSpaces(page, perPage)
      // Check if the data is paginated and extract the spaces from the "data" property
      if (
        response &&
        typeof response === 'object' &&
        Array.isArray(response.data)
      ) {
        setSpaces(response.data) // Set only the spaces array from the paginated data
        setTotalPages(response.last_page || 1) // Set total pages from the pagination metadata
        setCurrentPage(response.current_page || page) // Update current page from response
      } else if (Array.isArray(response)) {
        setSpaces(response) // Fallback to the original behavior if data is not paginated
        setTotalPages(1)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await getServices()
      if (response && response.data) {
        // Manejar tanto respuesta paginada como no paginada
        const servicesData = Array.isArray(response.data)
          ? response.data
          : response.data.data
        if (Array.isArray(servicesData)) {
          setServices(servicesData)
        } else {
          console.error('Formato de servicios inesperado:', servicesData)
          setServices([])
        }
      } else {
        console.error('Respuesta de servicios inválida:', response)
        setServices([])
      }
    } catch (err) {
      console.error('Error al cargar servicios:', err)
      setServices([])
    }
  }
  useEffect(() => {
    if (showForm || showList) {
      fetchSpaces(currentPage)
    }
    // Cargar servicios cuando se muestra el formulario
    if (showForm) {
      fetchServices()
    }
  }, [showForm, showList, currentPage])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('service_')) {
      // Handle service checkbox selection
      const serviceId = parseInt(name.split('_')[1])

      if (checked) {
        setSelectedServices((prev) => [...prev, serviceId])
      } else {
        setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
      }
    } else {
      // Handle other form inputs
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Create FormData object for file uploads
      const formDataToSend = new FormData()

      // Add all text fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key])
      })
      // Add selected services
      if (selectedServices.length > 0) {
        // Convert array of IDs to comma-separated string
        formDataToSend.append('services', selectedServices.join(','))
      } else {
        // Send empty string if no services selected
        formDataToSend.append('services', '')
      }

      // Add all image files
      if (imageEntries.length > 0) {
        imageEntries.forEach((entry, index) => {
          if (entry.file) {
            formDataToSend.append(`imageFiles[${index}]`, entry.file)
          }
        })
      }

      const data = await saveSpace(formDataToSend, editingId, true)

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
      setErrors(error.errors || {})
    }
  }
  const handleShowForm = () => {
    // Siempre limpiar el formulario al mostrar el formulario de creación
    setFormData({
      places: '',
      price: '',
      schedule: '',
      images: '',
      description: '',
      subtitle: '',
      address: '',
    })
    setImageEntries([])
    setScheduleEntries([])
    setSelectedServices([])
    setEditingId(null) // Asegurarnos de que no estamos en modo edición
    setShowForm(true)
    setShowList(false)
    // Cargar servicios al mostrar el formulario
    fetchServices()
  }
  const handleShowList = () => {
    setShowForm(false)
    setShowList(true)
    // Limpiar todos los estados
    setFormData({
      places: '',
      price: '',
      schedule: '',
      images: '',
      description: '',
      subtitle: '',
      address: '',
    })
    setImageEntries([])
    setScheduleEntries([])
    setSelectedServices([])
    // Limpiar el estado de edición si hay alguno activo
    setEditingId(null)
  }

  // Schedule validation and handling functions
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const hasTimeOverlap = (newStart, newEnd, day) => {
    const newStartMinutes = timeToMinutes(newStart)
    const newEndMinutes = timeToMinutes(newEnd)

    return scheduleEntries.some((entry) => {
      if (entry.day !== day) return false
      const existingStartMinutes = timeToMinutes(entry.startTime)
      const existingEndMinutes = timeToMinutes(entry.endTime)

      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      )
    })
  }

  const handleScheduleChange = (e) => {
    const { name, value } = e.target
    setScheduleForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSchedule = (e) => {
    e.preventDefault()
    const { day, startTime, endTime } = scheduleForm

    if (!day || !startTime || !endTime) {
      setErrors((prev) => ({
        ...prev,
        schedule: ['All schedule fields are required'],
      }))
      return
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setErrors((prev) => ({
        ...prev,
        schedule: ['End time must be after start time'],
      }))
      return
    }

    if (hasTimeOverlap(startTime, endTime, day)) {
      setErrors((prev) => ({
        ...prev,
        schedule: ['Time overlaps with existing schedule'],
      }))
      return
    }

    setScheduleEntries((prev) => [...prev, { day, startTime, endTime }])
    setScheduleForm({
      day: 'monday',
      startTime: '',
      endTime: '',
    })

    // Update formData.schedule with the new format
    const updatedEntries = [...scheduleEntries, { day, startTime, endTime }]
    const scheduleString = updatedEntries
      .map((entry) => `${entry.day}-${entry.startTime}-${entry.endTime}`)
      .join('|')

    setFormData((prev) => ({
      ...prev,
      schedule: scheduleString,
    }))
  }

  const handleRemoveSchedule = (index) => {
    const newEntries = scheduleEntries.filter((_, i) => i !== index)
    setScheduleEntries(newEntries)

    const scheduleString = newEntries
      .map((entry) => `${entry.day}-${entry.startTime}-${entry.endTime}`)
      .join('|')

    setFormData((prev) => ({
      ...prev,
      schedule: scheduleString,
    }))
  }

  const [editingId, setEditingId] = useState(null)
  const handleEditClick = (id) => {
    const spaceToEdit = spaces.find((space) => space.id === id)
    if (!spaceToEdit) return

    // Si ya estábamos editando este espacio, cerrar el formulario
    if (editingId === id) {
      setEditingId(null)
      return
    }

    // Procesar el horario
    const schedules = spaceToEdit.schedule
      ? spaceToEdit.schedule.split('|').map((schedule) => {
          const [day, startTime, endTime] = schedule.split('-')
          return { day, startTime, endTime }
        })
      : []

    // Procesar las imágenes
    const imageNames = spaceToEdit.images
      ? spaceToEdit.images.split('|').map((imagePath) => {
          const fileName = imagePath.split('/').pop()
          let fullPath = ''
          if (imagePath.startsWith('http')) {
            fullPath = imagePath
          } else if (imagePath.startsWith('storage/')) {
            fullPath = `https://localhost:8443/${imagePath}`
          } else {
            fullPath = `https://localhost:8443/storage/${imagePath}`
          }
          return {
            fileName,
            file: null,
            path: imagePath,
            url: fullPath,
            isExisting: true,
          }
        })
      : []

    // Procesar los servicios
    let serviceIds = []
    if (spaceToEdit.services) {
      if (typeof spaceToEdit.services === 'string') {
        // Si es una cadena, dividir por comas y convertir a números
        serviceIds = spaceToEdit.services
          .split(',')
          .map((id) => parseInt(id, 10))
      } else if (Array.isArray(spaceToEdit.services)) {
        // Si ya es un array, usar directamente
        serviceIds = spaceToEdit.services.map(
          (service) => service.id || parseInt(service, 10)
        )
      }
    }

    // Actualizar todos los estados
    setEditingId(id)
    setSelectedServices(serviceIds)
    setFormData({
      places: spaceToEdit.places || '',
      price: spaceToEdit.price || '',
      schedule: spaceToEdit.schedule || '',
      images: spaceToEdit.images || '',
      description: spaceToEdit.description || '',
      subtitle: spaceToEdit.subtitle || '',
      address: spaceToEdit.address || '',
    })
    setImageEntries(imageNames)
    setScheduleEntries(schedules)

    // Cargar servicios sin cambiar la vista
    fetchServices()
  }

  // Funciones para manejar las imágenes
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageForm({
        file: file,
        fileName: file.name,
      })
    }
  }
  const handleAddImage = (e) => {
    e.preventDefault()
    const { file, fileName } = imageForm

    if (!file) {
      setErrors((prev) => ({
        ...prev,
        images: ['Image file is required'],
      }))
      return
    }

    // Agregar la nueva entrada a la lista de imágenes
    setImageEntries((prev) => [...prev, { file, fileName }])

    // Reiniciar el formulario de imagen
    setImageForm({
      file: null,
      fileName: '',
    })

    // Resetear el campo de archivo
    // Convertir la referencia al elemento de entrada de archivo y resetear su valor
    const fileInputs = document.querySelectorAll('input[type="file"]')
    fileInputs.forEach((input) => {
      input.value = ''
    })

    // Actualizar el campo images en formData para compatibilidad
    const imageNamesString = [...imageEntries, { fileName }]
      .map((entry) => entry.fileName)
      .join('|')

    setFormData((prev) => ({
      ...prev,
      images: imageNamesString,
    }))
  }

  const handleDelete = async (id) => {
        if (window.confirm(t('actions.deleteConfirm'))) {
          try {
            setLoading(true)
            const response = await deleteSpace(id)
            // If deletion successful, refresh the user list
            if (response && response.success) {
              await fetchSpaces() // Refresh the list after successful deletion
            }
          } catch (error) {
            setError(t('actions.deleteError'))
          } finally {
            setLoading(false)
          }
        }
      }

  const handleRemoveImage = (index) => {
    const newEntries = imageEntries.filter((_, i) => i !== index)
    setImageEntries(newEntries)

    // Actualizar el campo images en formData para compatibilidad
    const imageNamesString = newEntries.map((entry) => entry.fileName).join('|')

    setFormData((prev) => ({
      ...prev,
      images: imageNamesString,
    }))
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
        <>
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
                      {' '}
                      <div className="card__text">
                        <p>
                          <span className="span--bold">
                            {t('form.space.label')}:{' '}
                          </span>
                          {space.subtitle}
                        </p>
                        <p>
                          <span className="span--bold">
                            {t('form.amount.label')}:{' '}
                          </span>
                          {space.price}€
                        </p>
                        <p>
                          <span className="span--bold">
                            {t('form.seats.label')}:{' '}
                          </span>
                          {space.places} {t('form.seats.label')}
                        </p>
                        {space.schedule
                          .split('|')
                          .map((schedule) => {
                            const [day, start, end] = schedule.split('-')
                            return { day, start, end }
                          })
                          .sort((a, b) => {
                            // Primero ordenar por día
                            const dayOrder = {
                              monday: 1,
                              tuesday: 2,
                              wednesday: 3,
                              thursday: 4,
                              friday: 5,
                            }
                            if (dayOrder[a.day] !== dayOrder[b.day]) {
                              return dayOrder[a.day] - dayOrder[b.day]
                            }
                            // Si es el mismo día, ordenar por hora de inicio
                            return a.start.localeCompare(b.start)
                          })
                          .map((schedule, index) => (
                            <p key={index}>
                              <span className="span--bold">
                                {t(`form.days.${schedule.day}`)}:{' '}
                              </span>
                              {schedule.start} - {schedule.end}
                            </p>
                          ))}
                      </div>
                    </div>
                    <div className="card__buttons">
                      <button
                        className="form__submit --noArrow"
                        onClick={() => handleEditClick(space.id)}
                      >
                        {t('actions.edit')}
                      </button>
                      <button className="form__submit --noArrow" onClick={() => handleDelete(space.id)}>
                        {t('actions.delete')}
                      </button>
                    </div>
                  </article>{' '}
                  {editingId === space.id && (
                    <article className="card--form--edit">
                      <form onSubmit={handleSubmit}>
                        <div className="form__section">
                          <label htmlFor="places">
                            {t('form.seats.label')}
                          </label>
                          <input
                            id="places"
                            name="places"
                            type="number"
                            placeholder={t('form.seats.placeholder')}
                            value={formData.places}
                            onChange={handleChange}
                            required
                            min={1}
                            onWheel={(e) => e.target.blur()}
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
                            {t('form.amount.label')}
                          </label>
                          <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            placeholder={t('form.amount.placeholder')}
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min={0}
                            onWheel={(e) => e.target.blur()}
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
                          <label>{t('form.spaceAvailability.label')}</label>
                          <div className="schedule-form">
                            <select
                              name="day"
                              value={scheduleForm.day}
                              onChange={handleScheduleChange}
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                  {t(`form.days.${day}`)}
                                </option>
                              ))}
                            </select>
                            <input
                              type="time"
                              name="startTime"
                              value={scheduleForm.startTime}
                              onChange={handleScheduleChange}
                              placeholder="Start Time"
                            />
                            <input
                              type="time"
                              name="endTime"
                              value={scheduleForm.endTime}
                              onChange={handleScheduleChange}
                              placeholder="End Time"
                            />
                            <button
                              type="button"
                              className="form__submit --noArrow"
                              onClick={handleAddSchedule}
                            >
                              {t('actions.add')}
                            </button>
                          </div>
                          {scheduleEntries.length > 0 && (
                            <div className="schedule-list">
                              {scheduleEntries.map((entry, index) => (
                                <div key={index} className="schedule-item">
                                  <span>
                                    {t(`form.days.${entry.day.toLowerCase()}`)}:{' '}
                                    {entry.startTime} - {entry.endTime}
                                  </span>
                                  <button
                                    type="button"
                                    className="form__submit --noArrow"
                                    onClick={() => handleRemoveSchedule(index)}
                                  >
                                    {t('actions.remove')}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {errors.schedule &&
                            Array.isArray(errors.schedule) &&
                            errors.schedule.map((err, idx) => (
                              <span className="form__error" key={idx}>
                                {t(`errors.${err}`)}
                              </span>
                            ))}
                        </div>
                        {/* Sección de imágenes en el formulario de edición */}
                        <div className="form__section">
                          <label>{t('form.images.label')}</label>
                          <div className="schedule-form">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              id="edit-image-input"
                            />
                            <button
                              type="button"
                              className="form__submit --noArrow"
                              onClick={handleAddImage}
                              disabled={!imageForm.file}
                            >
                              {t('actions.add')}
                            </button>
                          </div>
                          {imageEntries.length > 0 && (
                            <div className="schedule-list">
                              {imageEntries.map((entry, index) => (
                                <div
                                  key={index}
                                  className="schedule-item"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {console.log(entry)}
                                  <span style={{ flex: 1 }}>
                                    {entry.fileName}
                                    {entry.isExisting && (
                                      <a
                                        href={entry.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="image-preview-link"
                                        style={{ marginLeft: '10px' }}
                                      >
                                        (Ver imagen)
                                      </a>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    className="form__submit --noArrow"
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    {t('actions.remove')}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {errors.images &&
                            Array.isArray(errors.images) &&
                            errors.images.map((err, idx) => (
                              <span className="form__error" key={idx}>
                                {t(`errors.${err}`)}
                              </span>
                            ))}
                        </div>{' '}
                        <div className="form__section">
                          <label>{t('form.servicesAvailable')}</label>
                          <div
                            className="services-container"
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '10px',
                            }}
                          >
                            {services.length > 0 ? (
                              services.map((service) => (
                                <div
                                  key={service.id}
                                  className="service-checkbox"
                                  style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '120px',
                                  }}
                                >
                                  <img
                                    src={`https://localhost:8443/storage/${service.image_url}`}
                                    alt={service.nombre}
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      objectFit: 'cover',
                                      marginBottom: '5px',
                                    }}
                                  />
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      marginTop: '5px',
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      id={`edit-service-${service.id}`}
                                      name={`service_${service.id}`}
                                      checked={selectedServices.includes(
                                        service.id
                                      )}
                                      onChange={handleChange}
                                      style={{ marginRight: '5px' }}
                                    />
                                    <label
                                      htmlFor={`edit-service-${service.id}`}
                                      style={{ fontSize: '0.9em' }}
                                    >
                                      {service.nombre}
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p
                                style={{
                                  padding: '10px',
                                  fontStyle: 'italic',
                                  color: '#666',
                                }}
                              >
                                No hay servicios
                              </p>
                            )}
                          </div>
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
          {!loading && !error && spaces.length > 0 && (
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
      )}
      {showForm && (
        <section className="card__container--form">
          <article className="card--form">
            <form onSubmit={handleSubmit}>
              <div className="form__section">
                <label htmlFor="places">{t('form.seats.label')}</label>
                <input
                  id="places"
                  name="places"
                  type="number"
                  placeholder={t('form.seats.placeholder')}
                  value={formData.places}
                  onChange={handleChange}
                  required
                  min={1}
                  onWheel={(e) => e.target.blur()}
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
                <label htmlFor="price">{t('form.amount.label')}</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder={t('form.amount.placeholder')}
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min={0}
                  onWheel={(e) => e.target.blur()}
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
                <label>{t('form.spaceAvailability.label')}</label>
                <div className="schedule-form">
                  <select
                    name="day"
                    value={scheduleForm.day}
                    onChange={handleScheduleChange}
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {t(`form.days.${day}`)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    name="startTime"
                    value={scheduleForm.startTime}
                    onChange={handleScheduleChange}
                    placeholder="Start Time"
                  />
                  <input
                    type="time"
                    name="endTime"
                    value={scheduleForm.endTime}
                    onChange={handleScheduleChange}
                    placeholder="End Time"
                  />
                  <button
                    type="button"
                    className="form__submit --noArrow"
                    onClick={handleAddSchedule}
                  >
                    {t('actions.add')}
                  </button>
                </div>
                {scheduleEntries.length > 0 && (
                  <div className="schedule-list">
                    {scheduleEntries.map((entry, index) => (
                      <div key={index} className="schedule-item">
                        <span>
                          {t(`form.days.${entry.day.toLowerCase()}`)}:{' '}
                          {entry.startTime} - {entry.endTime}
                        </span>
                        <button
                          type="button"
                          className="form__submit --noArrow"
                          onClick={() => handleRemoveSchedule(index)}
                        >
                          {t('actions.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.schedule &&
                  Array.isArray(errors.schedule) &&
                  errors.schedule.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              {/* Sección de imágenes en el formulario de creación */}
              <div className="form__section">
                <label>{t('form.images.label')}</label>
                <div className="schedule-form">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="create-image-input"
                  />
                  <button
                    type="button"
                    className="form__submit --noArrow"
                    onClick={handleAddImage}
                    disabled={!imageForm.file}
                  >
                    {t('actions.add')}
                  </button>
                </div>
                {imageEntries.length > 0 && (
                  <div className="schedule-list">
                    {imageEntries.map((entry, index) => (
                      <div
                        key={index}
                        className="schedule-item"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {entry.isExisting && entry.url && (
                          <img
                            src={entry.url}
                            alt={entry.fileName}
                            style={{
                              width: '30px',
                              height: '30px',
                              objectFit: 'cover',
                              marginRight: '10px',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                        <span style={{ flex: 1 }}>
                          {entry.fileName}
                          {entry.isExisting && (
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="image-preview-link"
                              style={{ marginLeft: '10px' }}
                            >
                              (Ver imagen)
                            </a>
                          )}
                        </span>
                        <button
                          type="button"
                          className="form__submit --noArrow"
                          onClick={() => handleRemoveImage(index)}
                        >
                          {t('actions.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.images &&
                  Array.isArray(errors.images) &&
                  errors.images.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}{' '}
              </div>

              <div className="form__section">
                <label htmlFor="description">
                  {t('form.description.label')}
                </label>
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
                <label htmlFor="subtitle">{t('form.space.label')}</label>
                <input
                  id="subtitle"
                  name="subtitle"
                  placeholder={t('form.space.placeholder')}
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
              <div className="form__section">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  name="address"
                  placeholder="Introduce la dirección"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
                {errors.address &&
                  Array.isArray(errors.address) &&
                  errors.address.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {t(`errors.${err}`)}
                    </span>
                  ))}
              </div>
              <div className="form__section">
                <label>Servicios Disponibles</label>
                <div
                  className="services-container"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
                >
                  {services.length > 0 ? (
                    services.map((service) => (
                      <div
                        key={service.id}
                        className="service-checkbox"
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          width: '120px',
                        }}
                      >
                        <img
                          src={`https://localhost:8443/storage/${service.image_url}`}
                          alt={service.nombre}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            marginBottom: '5px',
                          }}
                        />
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '5px',
                          }}
                        >
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            name={`service_${service.id}`}
                            checked={selectedServices.includes(service.id)}
                            onChange={handleChange}
                            style={{ marginRight: '5px' }}
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            style={{ fontSize: '0.9em' }}
                          >
                            {service.nombre}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p
                      style={{
                        padding: '10px',
                        fontStyle: 'italic',
                        color: '#666',
                      }}
                    >
                      No hay servicios
                    </p>
                  )}
                </div>
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
