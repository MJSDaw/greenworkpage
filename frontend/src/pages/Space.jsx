import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ContactUs from '../components/ContactUs'
import { getSpaceById } from '../services/apiService'
import { useTranslation } from 'react-i18next'
import ServiceCard from '../components/ServiceCard'
import { getServices, createBooking, updateBooking } from '../services/apiService'
import {
  isAuthenticated,
  getUserType,
  getUserData,
} from '../services/authService'

import pc from '../assets/img/pc.svg'
import maps from '../assets/img/maps.svg'
import eur from '../assets/img/eur.svg'

const Space = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const [space, setSpace] = useState([])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [isUser, setIsUser] = useState(false)
  const [formData, setFormData] = useState({
    user_id: getUserData()?.id || '', // Pre-rellenamos con el ID del usuario actual
    space_id: id || '', // Pre-rellenamos con el ID del espacio actual
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
  // --- BOOKINGLIST-LIKE DEPENDENCIES ---
  const [availableSchedules, setAvailableSchedules] = useState([])
  const [existingBookings, setExistingBookings] = useState([])

  useEffect(() => {
    const userType = getUserType()
    setIsUser(isAuthenticated() && userType === 'user')
  }, [])

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
            services: response.data.services
              ? response.data.services.split(',').map((id) => parseInt(id, 10))
              : [],
            id: response.data.id, // <-- Añadimos el id para selectedSpace
            schedule: response.data.schedule // <-- Añadimos el schedule para selectedSpace
          }
          setSpace(spacesData)
          setSelectedSpace(spacesData) // <-- Establecemos selectedSpace automáticamente

          // Obtener servicios activos del espacio
          if (spacesData.services && spacesData.services.length > 0) {
            const servicesResponse = await getServices()
            if (servicesResponse && servicesResponse.data) {
              const activeServices = servicesResponse.data.filter((service) =>
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
  }, [id])

  // Fetch existing bookings for this space and date
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // getBookings API returns all bookings, filter by space_id
        const response = await import('../services/apiService').then(m => m.getBookings(1, 100));
        const bookingsArray = response?.data?.data || response?.data || [];
        setExistingBookings(bookingsArray.filter(b => b.space_id == id));
      } catch (err) {
        setExistingBookings([])
      }
    }
    fetchBookings()
  }, [id])

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
        user_id: Number(formData.user_id),
        space_id: Number(formData.space_id),
        start_time: `${formData.selected_date}T${formData.start_time}:00`,
        end_time: `${formData.selected_date}T${formData.end_time}:00`,
        reservation_period: `${formData.selected_date} ${formData.start_time}-${formData.selected_date} ${formData.end_time}`,
      }

      console.log('Sending booking data:', bookingData)

      const data = await createBooking(bookingData)

      if (data && (data.success || data.status === 'success')) {
        setErrors({})
        setFormData(prev => ({
          ...prev,
          start_time: '',
          end_time: '',
          selected_date: '',
          reservation_period: '',
        }))
        setAvailableSchedules([])
        alert('Reserva creada correctamente')
        // Opcional: recargar reservas o refrescar la página
        // window.location.reload()
      } else {
        setErrors(data.errors || { form: ['No se pudo crear la reserva'] })
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors(error.errors || { form: ['Error al crear la reserva'] })
    }
  }

  // --- BOOKINGLIST-LIKE HELPERS ---
  function parseSpaceSchedule(scheduleStr) {
    if (!scheduleStr) return []
    return scheduleStr.split('|').map((slot) => {
      const [day, start, end] = slot.split('-')
      return { day, start, end }
    })
  }
  function getDayOfWeek(dateStr) {
    const date = new Date(dateStr + 'T00:00:00Z')
    const days = [
      'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
    ]
    return days[date.getUTCDay()]
  }
  function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }
  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }
  function isValidTimeRange(start, end) {
    return timeToMinutes(start) < timeToMinutes(end)
  }
  // Get available slots for a date and space, excluding overlaps
  function getAvailableSlots(date, spaceId) {
    const dayOfWeek = getDayOfWeek(date)
    if (["saturday", "sunday"].includes(dayOfWeek)) return []
    if (!selectedSpace || !selectedSpace.schedule) return []
    const schedules = parseSpaceSchedule(selectedSpace.schedule).filter(s => s.day === dayOfWeek)
    if (!schedules.length) return []
    // Get bookings for this date and space
    const dateBookings = existingBookings.filter(b => {
      if (!b.space_id || b.space_id != spaceId) return false
      const bookingDate = new Date(b.start_time).toISOString().split('T')[0]
      return bookingDate === date
    })
    // Calculate available time ranges
    const availableRanges = []
    schedules.forEach(schedule => {
      const scheduleStart = timeToMinutes(schedule.start)
      const scheduleEnd = timeToMinutes(schedule.end)
      let timePoints = [
        { time: scheduleStart, type: 'start' },
        { time: scheduleEnd, type: 'end' }
      ]
      dateBookings.forEach(booking => {
        const startTime = new Date(booking.start_time).toTimeString().substring(0, 5)
        const endTime = new Date(booking.end_time).toTimeString().substring(0, 5)
        timePoints.push({ time: timeToMinutes(startTime), type: 'booked-start' })
        timePoints.push({ time: timeToMinutes(endTime), type: 'booked-end' })
      })
      timePoints.sort((a, b) => a.time - b.time)
      let isAvailable = false
      let rangeStart = null
      timePoints.forEach(point => {
        if (point.type === 'start') {
          rangeStart = point.time
          isAvailable = true
        } else if (point.type === 'booked-start') {
          if (isAvailable && rangeStart !== null && point.time > rangeStart) {
            availableRanges.push({ start: minutesToTime(rangeStart), end: minutesToTime(point.time) })
          }
          isAvailable = false
        } else if (point.type === 'booked-end') {
          rangeStart = point.time
          isAvailable = true
        } else if (point.type === 'end') {
          if (isAvailable && rangeStart !== null && point.time > rangeStart) {
            availableRanges.push({ start: minutesToTime(rangeStart), end: minutesToTime(point.time) })
          }
        }
      })
    })
    return availableRanges
  }

  // Genera un array de horas libres (en string 'HH:MM') a partir de los availableSchedules
  function getFreeTimeslots(schedules, step = 60) {
    const slots = []
    schedules.forEach(range => {
      let start = timeToMinutes(range.start)
      const end = timeToMinutes(range.end)
      while (start + step <= end) {
        slots.push(minutesToTime(start))
        start += step
      }
    })
    return slots
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
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                src={service.image_url}
                title={service.name}
              />
            ))}
          </article>
          <article className="space__description">
            <div>
              <h2>{t('form.description.label')}</h2>
              <p>{space.description}</p>
            </div>
            <div className="space__booking">
              <h2>{t('actions.doBookingTitle')}</h2>
              {isAuthenticated() ? (
                isUser ? (
                  <section className="card__container--form">
                    <article className="card--form">
                      <form onSubmit={handleSubmit}>
                        <input
                          type="hidden"
                          name="user_id"
                          value={formData.user_id}
                        />
                        <input
                          type="hidden"
                          name="space_id"
                          value={formData.space_id}
                        />
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
                                    {t(
                                      `form.days.${schedule.day.toLowerCase()}`
                                    )}
                                    : {schedule.start} - {schedule.end}
                                  </p>
                                ))}
                            </div>
                          </div>
                        )}
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
                                <label htmlFor="start_time">{t('form.time.startTime')}:</label>
                                <select
                                  id="start_time"
                                  name="start_time"
                                  value={formData.start_time}
                                  onChange={handleChange}
                                  required
                                >
                                  <option value="">{t('form.time.selectStartTime')}</option>
                                  {getFreeTimeslots(availableSchedules).map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              {formData.start_time && (
                                <div className="form__section">
                                  <label htmlFor="end_time">{t('form.time.endTime')}:</label>
                                  <select
                                    id="end_time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                  >
                                    <option value="">Selecciona hora de fin</option>
                                    {(() => {
                                      // Buscar el rango donde está el start_time
                                      const start = formData.start_time
                                      const range = availableSchedules.find(r => timeToMinutes(start) >= timeToMinutes(r.start) && timeToMinutes(start) < timeToMinutes(r.end))
                                      if (!range) return null
                                      const startMin = timeToMinutes(start) + 60
                                      const endMin = timeToMinutes(range.end)
                                      const options = []
                                      for (let t = startMin; t <= endMin; t += 60) {
                                        options.push(minutesToTime(t))
                                      }
                                      return options.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                      ))
                                    })()}
                                  </select>
                                </div>
                              )}
                            </>
                          )}
                        {formData.selected_date &&
                          availableSchedules.length === 0 && (
                            <div className="form__section">
                              <p className="form__error">
                                {t('form.date.noSlot')}
                              </p>
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
                          disabled={
                            !formData.user_id ||
                            !formData.space_id ||
                            !formData.selected_date ||
                            !formData.start_time ||
                            !formData.end_time ||
                            !isValidTimeRange(formData.start_time, formData.end_time)
                          }
                        />
                      </form>
                    </article>
                  </section>
                ) : (
                  <div className="login-message">
                    <p>{t('form.adminNoBooking')}</p>
                  </div>
                )
              ) : (
                <div className="login-message">
                  <p>{t('form.loginRequired')}</p>
                  <Link to="/login" className="form__submit --noArrow">
                    {t('actions.login')}
                  </Link>
                </div>
              )}
            </div>
          </article>
        </section>
      </main>
      <ContactUs />
    </>
  )
}

export default Space
