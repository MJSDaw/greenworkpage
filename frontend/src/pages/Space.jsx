import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ContactUs from '../components/ContactUs'
import { getSpaceById } from '../services/apiService'
import { useTranslation } from 'react-i18next'
import ServiceCard from '../components/ServiceCard'
import { getServices } from '../services/apiService'

import pc from '../assets/img/pc.svg'
import maps from '../assets/img/maps.svg'
import eur from '../assets/img/eur.svg'

const Space = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const [space, setSpace] = useState([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    user_id: '',
    space_id: '',
    selected_date: '', // To store the selected date
    selected_day: '', // To store the day of week
    start_time: '', // To store the start time
    end_time: '', // To store the end time
    reservation_period: '', // To store the formatted period for display
  })
  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})
  const [spaces, setSpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true)
        const response = await getSpaceById(id)
        if (response && response.data) {
          const spacesData = {
            src: `https://localhost:8443/storage/${response.data.images.split('|')[0]}`,
            subtitle: response.data.subtitle,
            amount: response.data.price,
            maps: response.data.address || '',
            seats: response.data.places,
            description: response.data.description,
            services: response.data.services ? response.data.services.split(',').map(id => parseInt(id, 10)) : []
          }
          setSpace(spacesData)
          
          // Obtener servicios activos del espacio
          if (spacesData.services && spacesData.services.length > 0) {
            const servicesResponse = await getServices()
            if (servicesResponse && servicesResponse.data) {
              const activeServices = servicesResponse.data.filter(service => 
                spacesData.services.includes(service.id)
              )
              setServices(activeServices)
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar espacios:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpace()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(`handleChange - name: ${name}, value: ${value}`)

    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value }

      // When space is selected, clear the schedule-related fields
      if (name === 'space_id') {
        console.log('Finding space with id:', value)
        console.log('Available spaces:', spaces)
        const numericId = Number(value)
        const space = spaces.find((s) => s.id === numericId)
        console.log('Selected space:', space)
        setSelectedSpace(space)
        return {
          ...newData,
          selected_date: '',
          selected_day: '',
          selected_schedule: '',
          reservation_period: '',
        }
      }

      // When date is selected
      if (name === 'selected_date') {
        console.log('Date selected:', value)
        const dayOfWeek = getDayOfWeek(value)
        console.log('Day of week:', dayOfWeek)

        if (['saturday', 'sunday'].includes(dayOfWeek)) {
          setErrors((prev) => ({
            ...prev,
            selected_date: ['Weekends are not available for booking'],
          }))
          return newData
        }

        // Find available slots for this date and space
        console.log(
          'Getting slots for date:',
          value,
          'and space:',
          newData.space_id
        )
        const slots = getAvailableSlots(value, newData.space_id)
        console.log('Available slots:', slots)
        setAvailableSchedules(slots)

        return {
          ...newData,
          selected_day: dayOfWeek,
          selected_schedule: '',
          reservation_period: '',
        }
      }
      // When start time is selected
      if (name === 'start_time' && value) {
        console.log('Start time selected:', value)
        return {
          ...newData,
          start_time: value,
          end_time: '',
          reservation_period: '',
        }
      }

      // When end time is selected
      if (name === 'end_time' && value) {
        console.log('End time selected:', value)
        const date = newData.selected_date
        const start = newData.start_time
        const end = value

        if (isValidTimeRange(start, end)) {
          const reservationPeriod = `${date} ${start}-${date} ${end}`
          console.log('Final reservation period:', reservationPeriod)
          return {
            ...newData,
            end_time: value,
            reservation_period: reservationPeriod,
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            end_time: ['La hora de fin debe ser posterior a la hora de inicio'],
          }))
          return {
            ...newData,
            end_time: '',
            reservation_period: '',
          }
        }
      }

      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validate required fields
      if (
        !formData.user_id ||
        !formData.space_id ||
        !formData.selected_date ||
        !formData.start_time ||
        !formData.end_time
      ) {
        setErrors({
          form: ['All fields are required'],
        })
        return
      }

      // Validate that start time is before end time
      if (!isValidTimeRange(formData.start_time, formData.end_time)) {
        setErrors({
          form: ['End time must be after start time'],
        })
        return
      }

      // Preparar los datos para enviar al backend
      const bookingData = {
        user_id: formData.user_id,
        space_id: formData.space_id,
        start_date: `${formData.selected_date} ${formData.start_time}`,
        end_date: `${formData.selected_date} ${formData.end_time}`,
        reservation_period: `${formData.selected_date} ${formData.start_time}-${formData.selected_date} ${formData.end_time}`,
      }

      console.log('Sending booking data:', bookingData)

      const data = editingId
        ? await updateBooking(editingId, bookingData)
        : await createBooking(bookingData)

      if (data && data.success) {
        if (editingId) {
          setEditingId(null)
          setErrors({})
        } else {
          setErrors({})
          setShowForm(false)
          setShowList(true)
        }
        fetchBookings()
      } else {
        setErrors(data.errors || {})
      }
    } catch (error) {
      setErrors(error.errors || {})
    }
  }

  return (
    <>
      <main className="terms__background--space">
        <section className="terms">
          <h1 className="h1--left">
            {t('form.space.label')} {space.subtitle}
          </h1>
          <article className="space__grid">
            <img src={space.src} alt={space.subtitle} className="space__img" />
            <div className="space__features">
              <h2>{t('common.features')}</h2>
              <div className="feature__item">
                <img src={pc} alt="Seats icon" />
                <span>
                  {space.seats} {t('form.seats.label')}
                </span>
              </div>
              <div className="feature__item">
                <img src={maps} alt="Location icon" />
                <span>{space.maps}</span>
              </div>
              <div className="feature__item">
                <img src={eur} alt="Price icon" />
                <span>
                  {space.amount} / {t('form.time.label')}
                </span>
              </div>
            </div>
          </article>
          <article className="space__services">
            {services.length > 0 && <h2>{t('common.services')}</h2>}
            <div className="services__grid">
              {services.map((service) => (
                <ServiceCard 
                  key={service.id}
                  src={service.image_url}
                  title={service.nombre}
                />
              ))}
            </div>
          </article>
          <article className="space__description">
            <div>
              <h2>{t('form.description.label')}</h2>
              <p>{space.description}</p>
            </div>
            <div className="space__booking">
              <h2>{t('actions.doBookingTitle')}</h2>
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
                        {users.map((user) => (
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
                        {spaces.map((space) => (
                          <option key={space.id} value={space.id}>
                            {space.subtitle} ({space.price}€ - {space.places}{' '}
                            {t('form.seats.label')})
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
                    {selectedSpace && (
                      <div className="form__section">
                        <label>{t('form.spaceAvailability.label')}</label>
                        <div className="schedule-display">
                          {parseSpaceSchedule(selectedSpace.schedule)
                            .sort((a, b) => {
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
                              return a.start.localeCompare(b.start)
                            })
                            .map((schedule, index) => (
                              <p key={index}>
                                {t(`form.days.${schedule.day.toLowerCase()}`)}:{' '}
                                {schedule.start} - {schedule.end}
                              </p>
                            ))}
                        </div>
                      </div>
                    )}
                    {formData.space_id && (
                      <div className="form__section">
                        <label htmlFor="selected_date">
                          {t('form.date.label')}
                        </label>
                        <input
                          id="selected_date"
                          name="selected_date"
                          type="date"
                          value={formData.selected_date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                        {errors.selected_date &&
                          Array.isArray(errors.selected_date) &&
                          errors.selected_date.map((err, idx) => (
                            <span className="form__error" key={idx}>
                              {t(`errors.${err}`)}
                            </span>
                          ))}
                      </div>
                    )}{' '}
                    {formData.selected_date &&
                      availableSchedules.length > 0 && (
                        <>
                          <div className="form__section">
                            <label>{t('form.date.available')}: </label>
                            <div className="schedule-display">
                              {availableSchedules.map((range, index) => (
                                <p key={index}>
                                  {range.start} - {range.end}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="form__section">
                            <label htmlFor="start_time">
                              {t('form.time.startTime')}: 
                            </label>
                            <select
                              id="start_time"
                              name="start_time"
                              value={formData.start_time || ''}
                              onChange={handleChange}
                              required
                            >
                              <option value="">
                                {t('form.time.selectStartTime')}
                              </option>
                              {parseSpaceSchedule(selectedSpace.schedule)
                                .filter(
                                  (s) =>
                                    s.day ===
                                    getDayOfWeek(formData.selected_date)
                                )
                                .map((schedule, index) => {
                                  const startMinutes = timeToMinutes(
                                    schedule.start
                                  )
                                  const endMinutes = timeToMinutes(schedule.end)
                                  const options = []
                                  for (
                                    let time = startMinutes;
                                    time < endMinutes;
                                    time += 60
                                  ) {
                                    const timeStr = minutesToTime(time)
                                    options.push(
                                      <option key={timeStr} value={timeStr}>
                                        {timeStr}
                                      </option>
                                    )
                                  }
                                  return options
                                })}
                            </select>
                          </div>

                          {formData.start_time && (
                            <div className="form__section">
                              <label htmlFor="end_time">Hora de fin:</label>
                              <select
                                id="end_time"
                                name="end_time"
                                value={formData.end_time || ''}
                                onChange={handleChange}
                                required
                              >
                                <option value="">Selecciona hora de fin</option>
                                {parseSpaceSchedule(selectedSpace.schedule)
                                  .filter(
                                    (s) =>
                                      s.day ===
                                      getDayOfWeek(formData.selected_date)
                                  )
                                  .map((schedule, index) => {
                                    if (
                                      timeToMinutes(schedule.start) <=
                                        timeToMinutes(formData.start_time) &&
                                      timeToMinutes(schedule.end) >
                                        timeToMinutes(formData.start_time)
                                    ) {
                                      const startMinutes =
                                        timeToMinutes(formData.start_time) + 60
                                      const endMinutes = timeToMinutes(
                                        schedule.end
                                      )
                                      const options = []
                                      for (
                                        let time = startMinutes;
                                        time <= endMinutes;
                                        time += 60
                                      ) {
                                        const timeStr = minutesToTime(time)
                                        options.push(
                                          <option key={timeStr} value={timeStr}>
                                            {timeStr}
                                          </option>
                                        )
                                      }
                                      return options
                                    }
                                    return null
                                  })}
                              </select>
                            </div>
                          )}
                        </>
                      )}
                    {formData.selected_date &&
                      availableSchedules.length === 0 && (
                        <div className="form__section">
                          <p className="form__error">{t('form.date.noSlot')}</p>
                          {existingBookings
                            .filter(
                              (b) =>
                                b.space_id === formData.space_id &&
                                b.reservation_period.includes(
                                  formData.selected_date
                                )
                            )
                            .map((booking, index) => (
                              <p key={index} className="booking-info">
                                Reserved:{' '}
                                {booking.reservation_period.split(' ')[1]} -{' '}
                                {booking.reservation_period.split(' ')[3]}
                              </p>
                            ))}
                        </div>
                      )}
                    {errors.form &&
                      Array.isArray(errors.form) &&
                      errors.form.map((err, idx) => (
                        <span className="form__error" key={idx}>
                          {t(`errors.${err}`)}
                        </span>
                      ))}
                    <input
                      type="submit"
                      value={t('actions.bookingsCreate')}
                      className="form__submit"
                      disabled={!formData.reservation_period}
                    />
                  </form>
                </article>
              </section>
            </div>
          </article>
        </section>
      </main>
      <ContactUs />
    </>
  )
}

export default Space
