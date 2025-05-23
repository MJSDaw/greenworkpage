import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getBookings,
  getUsers,
  getSpaces,
  createBooking,
  updateBooking,
} from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

const BookingList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    user_id: '',
    space_id: '',
    selected_date: '', // To store the selected date
    selected_day: '', // To store the day of week
    start_time: '', // To store the start time
    end_time: '', // To store the end time
    reservation_period: '', // To store the formatted period for display
  })

  // New state variables for schedule handling
  const [availableSchedules, setAvailableSchedules] = useState([])
  const [existingBookings, setExistingBookings] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getBookings(currentPage, perPage)

      // Extract the bookings array from the paginated response
      const bookingsArray = response?.data?.data || []
      setBookings(bookingsArray)

      // Set pagination data
      setTotalPages(response?.data?.last_page || 1)
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
  }, [showList, currentPage])
  // Effect to update existingBookings when bookings change
  useEffect(() => {
    console.log('Current bookings:', bookings)
    setExistingBookings(bookings)
  }, [bookings])

  // Effect to clear schedule-related state when form is shown/hidden
  useEffect(() => {
    if (showForm) {
      setFormData({
        user_id: '',
        space_id: '',
        selected_date: '',
        selected_day: '',
        selected_schedule: '',
        reservation_period: '',
      })
      setSelectedSpace(null)
      setAvailableSchedules([])
    }
  }, [showForm])

  const fetchUsersAndSpaces = async () => {
    try {
      const [usersData, spacesData] = await Promise.all([
        getUsers(),
        getSpaces(),
      ])

      // Asegurarse de manejar tanto la respuesta paginada como la no paginada
      const usersList =
        usersData?.data?.data || usersData?.data || usersData || []
      const spacesList =
        spacesData?.data?.data || spacesData?.data || spacesData || []

      setUsers(usersList)
      setSpaces(spacesList)
    } catch (err) {
      setError(err.message)
    }
  }
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
            selected_date: t('errors.weekends'),
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
      const bookingToEdit = bookings.find((booking) => {
        const bookingId =
          booking.id ||
          `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`
        return bookingId === id
      })

      if (!bookingToEdit) {
        console.error('Booking not found:', id)
        return
      }

      console.log('Editing booking:', bookingToEdit)

      let startDate, startTime, endTime

      if (bookingToEdit.start_date) {
        // Use start_date and end_date if available
        startDate = bookingToEdit.start_date.split(' ')[0]
        startTime = bookingToEdit.start_date.split(' ')[1]
        endTime = bookingToEdit.end_date.split(' ')[1]
      } else if (bookingToEdit.reservation_period) {
        // Parse the reservation period as fallback
        if (bookingToEdit.reservation_period.includes('|')) {
          const [start, end] = bookingToEdit.reservation_period.split('|')
          ;[startDate, startTime] = start.split(' ')
          endTime = end.split(' ')[1]
        } else {
          const [start, end] = bookingToEdit.reservation_period.split('-')
          ;[startDate, startTime] = start.trim().split(' ')
          endTime = end.trim().split(' ')[1]
        }
      }

      // Find the space and trigger available slots calculation
      const space = spaces.find((s) => s.id === bookingToEdit.space_id)
      setSelectedSpace(space)

      setFormData({
        user_id: bookingToEdit.user_id,
        space_id: bookingToEdit.space_id,
        selected_date: startDate || '',
        selected_day: startDate ? getDayOfWeek(startDate) : '',
        start_time: startTime || '',
        end_time: endTime || '',
        reservation_period:
          startDate && startTime && endTime
            ? `${startDate} ${startTime}-${startDate} ${endTime}`
            : '',
      })

      // Calculate available slots if we have both date and space
      if (startDate && bookingToEdit.space_id) {
        const slots = getAvailableSlots(startDate, bookingToEdit.space_id)
        setAvailableSchedules(slots)
      }
    }
  }

  // Helper function to get day of week from date
  const getDayOfWeek = (dateStr) => {
    // Create date using UTC to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00Z')
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    return days[date.getUTCDay()]
  }

  // Helper function to parse space schedule
  const parseSpaceSchedule = (scheduleStr) => {
    if (!scheduleStr) return []
    return scheduleStr.split('|').map((slot) => {
      const [day, start, end] = slot.split('-')
      return { day, start, end }
    })
  }

  // Function to convert time to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }
  // Function to get available time slots for a specific day
  const getAvailableSlots = (date, spaceId) => {
    console.log('Getting available slots for:', { date, spaceId })
    console.log('Current spaces:', spaces)
    console.log('Editing ID:', editingId)

    const numericSpaceId = Number(spaceId)
    const space = spaces.find((s) => s.id === numericSpaceId)

    if (!space) {
      console.log('Space not found')
      return []
    }

    console.log('Space found:', space)

    const targetDate = new Date(date + 'T00:00:00Z')
    const dayOfWeek = getDayOfWeek(date)

    if (['saturday', 'sunday'].includes(dayOfWeek)) {
      return []
    }

    // Find schedules for this day of week
    const schedules = parseSpaceSchedule(space.schedule).filter(
      (s) => s.day === dayOfWeek
    )

    if (schedules.length === 0) return []

    const formattedDate = targetDate.toISOString().split('T')[0]

    // Get bookings for this date and space, excluding the booking being edited
    const dateBookings = existingBookings.filter((b) => {
      if (!b.reservation_period || b.space_id !== numericSpaceId) return false

      // Skip this booking if it's the one being edited
      const bookingId =
        b.id || `${b.user_id}-${b.space_id}-${b.reservation_period}`
      if (editingId === bookingId) {
        console.log('Excluding current booking:', bookingId)
        return false
      }

      // Handle both formats: "date time|date time" and "date time-date time"
      let bookingDate
      if (b.reservation_period.includes('|')) {
        bookingDate = b.reservation_period.split('|')[0].split(' ')[0]
      } else {
        bookingDate = b.reservation_period.split('-')[0].trim().split(' ')[0]
      }

      console.log('Comparing dates:', {
        bookingDate,
        formattedDate,
        fullPeriod: b.reservation_period,
      })

      return bookingDate === formattedDate
    })

    // Instead of generating 1-hour slots, we'll return the full available ranges
    const availableRanges = []

    schedules.forEach((schedule) => {
      let [startHour] = schedule.start.split(':').map(Number)
      const [endHour] = schedule.end.split(':').map(Number)

      // Convert schedule times to minutes for comparison
      const scheduleStartMinutes = timeToMinutes(schedule.start)
      const scheduleEndMinutes = timeToMinutes(schedule.end)

      // Find gaps between bookings
      const timePoints = []

      // Add schedule start
      timePoints.push({
        time: scheduleStartMinutes,
        type: 'start',
      }) // Add booking times
      dateBookings.forEach((booking) => {
        // Handle both formats: "date time|date time" and "date time-date time"
        let bookingStartTime, bookingEndTime

        if (booking.reservation_period.includes('|')) {
          const [start, end] = booking.reservation_period.split('|')
          bookingStartTime = start.split(' ')[1]
          bookingEndTime = end.split(' ')[1]
        } else {
          const [bookingStart, bookingEnd] = booking.reservation_period
            .split('-')
            .map((part) => part.trim())
          ;[, bookingStartTime] = bookingStart.split(' ')
          ;[, bookingEndTime] = bookingEnd.split(' ')
        }

        console.log('Processing booking:', {
          period: booking.reservation_period,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          isCurrentBooking:
            editingId ===
            (booking.id ||
              `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`),
        })

        // Solo agregamos los puntos de tiempo si no es la reserva que estamos editando
        if (
          editingId !==
          (booking.id ||
            `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`)
        ) {
          timePoints.push({
            time: timeToMinutes(bookingStartTime),
            type: 'booked-start',
          })
          timePoints.push({
            time: timeToMinutes(bookingEndTime),
            type: 'booked-end',
          })
        }
      })

      // Add schedule end
      timePoints.push({
        time: scheduleEndMinutes,
        type: 'end',
      })

      // Sort time points chronologically
      timePoints.sort((a, b) => a.time - b.time)

      // Find available ranges
      let isAvailable = true
      let rangeStart = null

      timePoints.forEach((point, index) => {
        if (point.type === 'start') {
          rangeStart = point.time
          isAvailable = true
        } else if (point.type === 'booked-start') {
          // Si hay un rango que empezó antes, lo guardamos
          if (rangeStart !== null && point.time > rangeStart) {
            availableRanges.push({
              start: minutesToTime(rangeStart),
              end: minutesToTime(point.time),
            })
          }
          isAvailable = false
        } else if (point.type === 'booked-end') {
          rangeStart = point.time
          isAvailable = true
        } else if (point.type === 'end') {
          // Si hay un rango abierto cuando llegamos al final del horario
          if (rangeStart !== null && point.time > rangeStart) {
            availableRanges.push({
              start: minutesToTime(rangeStart),
              end: minutesToTime(point.time),
            })
          }
        }
      })
    })

    return availableRanges
  }

  // Helper function to convert minutes to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Helper function to validate time range
  const isValidTimeRange = (start, end) => {
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    return startMinutes < endMinutes
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
      </div>{' '}
      {showList && (
        <>
          <section className="card__container">
            {loading && <p>{t('common.bookingsLoading')}</p>}
            {error && <p>{t('common.commonError', { error: error })}</p>}
            {!loading && !error && bookings.length === 0 && (
              <p>{t('common.bookingsNoBookings')}</p>
            )}
            {!loading &&
              !error &&
              bookings.map((booking) => (
                <React.Fragment
                  key={
                    booking.id ||
                    `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`
                  }
                >
                                        {console.log(booking)}

                  <article className="card">
                    <div className="card__content">
                      <div className="card__text">
                        <p>
                          <span className="span--bold">{t('form.user.label')}: </span>
                          {booking.user?.name || booking.user_id}
                        </p>
                        <p>
                          <span className="span--bold">{t('form.space.label')}: </span>
                          {booking.space?.subtitle || booking.space_id}
                        </p>
                        <p>
                          <span className="span--bold">{t('form.period.label')}: </span>
                          {booking.start_date ||
                            booking.reservation_period?.split('|')[0]}{' '}
                          |{' '}
                          {booking.end_date ||
                            (booking.reservation_period
                              ? booking.reservation_period.split('|')[1]
                              : '')}
                        </p>
                      </div>
                    </div>
                    <div className="card__buttons">
                      <button
                        className="form__submit --noArrow"
                        onClick={() =>
                          handleEditClick(
                            booking.id ||
                              `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`
                          )
                        }
                      >
                        {t('actions.edit')}
                      </button>
                      <button className="form__submit --noArrow">
                        {t('actions.delete')}
                      </button>
                    </div>
                  </article>
                  {editingId ===
                    (booking.id ||
                      `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`) && (
                    <article className="card--form--edit">
                      <form onSubmit={handleSubmit}>
                        <div className="form__section">
                          <label htmlFor="user_id">
                            {t('form.user.label')}:
                          </label>
                          <select
                            id="user_id"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleChange}
                            required
                          >
                            <option value="">
                              {t('form.user.placeholder')}
                            </option>
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
                          <label htmlFor="space_id">
                            {t('form.space.label')}:
                          </label>
                          <select
                            id="space_id"
                            name="space_id"
                            value={formData.space_id}
                            onChange={handleChange}
                            required
                          >
                            <option value="">
                              {t('form.space.placeholder')}
                            </option>
                            {spaces.map((space) => (
                              <option key={space.id} value={space.id}>
                                {space.subtitle} ({space.price}€ -{' '}
                                {space.places} {t('form.seats.label')}
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
                            <label>{t('form.spaceAvailability.label')}:</label>
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
                                  return dayOrder[a.day] !== dayOrder[b.day]
                                    ? dayOrder[a.day] - dayOrder[b.day]
                                    : a.start.localeCompare(b.start)
                                })
                                .map((schedule, index) => (
                                  <p key={index}>
                                    {t(`form.days.${schedule.day}`)}
                                    : {schedule.start} - {schedule.end}
                                  </p>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="form__section">
                          <label htmlFor="selected_date">
                            {t('form.date.label')}:
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
                                <label htmlFor="start_time">
                                  {t('form.time.startTime')}
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
                                      const endMinutes = timeToMinutes(
                                        schedule.end
                                      )
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
                                  <label htmlFor="end_time">{t('form.time.endTime')}</label>
                                  <select
                                    id="end_time"
                                    name="end_time"
                                    value={formData.end_time || ''}
                                    onChange={handleChange}
                                    required
                                  >
                                    <option value="">
                                      {t('form.time.selectEndTime')}
                                    </option>
                                    {parseSpaceSchedule(selectedSpace.schedule)
                                      .filter(
                                        (s) =>
                                          s.day ===
                                          getDayOfWeek(formData.selected_date)
                                      )
                                      .map((schedule, index) => {
                                        if (
                                          timeToMinutes(schedule.start) <=
                                            timeToMinutes(
                                              formData.start_time
                                            ) &&
                                          timeToMinutes(schedule.end) >
                                            timeToMinutes(formData.start_time)
                                        ) {
                                          const startMinutes =
                                            timeToMinutes(formData.start_time) +
                                            60
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
                                              <option
                                                key={timeStr}
                                                value={timeStr}
                                              >
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

                        <input
                          type="submit"
                          value={t('actions.edit')}
                          className="form__submit"
                          disabled={!formData.reservation_period}
                        />
                      </form>
                    </article>
                  )}
                </React.Fragment>
              ))}
          </section>
          {!loading && !error && bookings.length > 0 && (
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                          {t(`form.days.${schedule.day.toLowerCase()}`)}
                          : {schedule.start} - {schedule.end}
                        </p>
                      ))}
                  </div>
                </div>
              )}
              {formData.space_id && (
                <div className="form__section">
                  <label htmlFor="selected_date">{t('form.date.label')}</label>
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
              {formData.selected_date && availableSchedules.length > 0 && (
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
                    <label htmlFor="start_time">{t('form.time.startTime')}: </label>
                    <select
                      id="start_time"
                      name="start_time"
                      value={formData.start_time || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">{t('form.time.selectStartTime')}</option>
                      {parseSpaceSchedule(selectedSpace.schedule)
                        .filter(
                          (s) => s.day === getDayOfWeek(formData.selected_date)
                        )
                        .map((schedule, index) => {
                          const startMinutes = timeToMinutes(schedule.start)
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
                              s.day === getDayOfWeek(formData.selected_date)
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
                              const endMinutes = timeToMinutes(schedule.end)
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
              {formData.selected_date && availableSchedules.length === 0 && (
                <div className="form__section">
                  <p className="form__error">
                    {t('form.date.noSlot')}
                  </p>
                  {existingBookings
                    .filter(
                      (b) =>
                        b.space_id === formData.space_id &&
                        b.reservation_period.includes(formData.selected_date)
                    )
                    .map((booking, index) => (
                      <p key={index} className="booking-info">
                        Reserved: {booking.reservation_period.split(' ')[1]} -{' '}
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
      )}
    </>
  )
}

export default BookingList
