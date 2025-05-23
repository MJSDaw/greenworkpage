import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getUpcomingBookings,
  getPastBookings,
  getUserBookings,
  getUsers,
  getSpaces,
  createBooking,
  updateBooking,
  deleteBooking
} from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

const BookingList = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    user_id: '',
    space_id: '',
    selected_date: '',
    start_time: '',
    end_time: '',
    purpose: '',
    notes: '',
  })

  // State variables for bookings and schedules
  const [availableSchedules, setAvailableSchedules] = useState([])
  const [existingBookings, setExistingBookings] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [editingId, setEditingId] = useState(null)

  // UI state
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [bookingFilter, setBookingFilter] = useState('all') // 'all', 'upcoming', 'past', 'current'
  
  // Data state
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [spaces, setSpaces] = useState([])
  
  // UI feedback state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3
  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let response;
      
      switch (bookingFilter) {
        case 'upcoming':
          response = await getUpcomingBookings(currentPage, perPage);
          break;
        case 'past':
          response = await getPastBookings(currentPage, perPage);
          break;
        case 'my':
          response = await getUserBookings(currentPage, perPage);
          break;
        default:
          // Por defecto, obtener todas las reservas
          response = await getBookings(currentPage, perPage);
      }

      // Extract the bookings array from the response
      const bookingsArray = response?.data?.data || [];
      setBookings(bookingsArray);

      // Set pagination data
      setTotalPages(response?.data?.last_page || 1);
    } catch (err) {
      setError(err.message || 'Error al obtener reservas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (showList) {
      fetchBookings();
      fetchUsersAndSpaces();
    }
  }, [showList, currentPage, bookingFilter]);

  // Update existingBookings when bookings change
  useEffect(() => {
    setExistingBookings(bookings);
  }, [bookings]);

  // Reset form state when showing/hiding form
  useEffect(() => {
    if (showForm) {
      setFormData({
        user_id: '',
        space_id: '',
        selected_date: '',
        start_time: '',
        end_time: '',
        purpose: '',
        notes: '',
      });
      setSelectedSpace(null);
      setAvailableSchedules([]);
      setErrors({});
    }
  }, [showForm]);

  const fetchUsersAndSpaces = async () => {
    try {
      const [usersData, spacesData] = await Promise.all([
        getUsers(),
        getSpaces(),
      ]);

      // Handle both paginated and non-paginated responses
      const usersList = usersData?.data?.data || usersData?.data || usersData || [];
      const spacesList = spacesData?.data?.data || spacesData?.data || spacesData || [];

      setUsers(usersList);
      setSpaces(spacesList);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => {
      const newData = { ...prevData, [name]: value };

      // When space is selected, reset date/time selections
      if (name === 'space_id') {
        const numericId = Number(value);
        const space = spaces.find((s) => s.id === numericId);
        setSelectedSpace(space);
        return {
          ...newData,
          selected_date: '',
          start_time: '',
          end_time: '',
        };
      }

      // When date is selected
      if (name === 'selected_date') {
        const dayOfWeek = getDayOfWeek(value);

        // Check if weekends are available (you could customize this)
        if (['saturday', 'sunday'].includes(dayOfWeek)) {
          setErrors((prev) => ({
            ...prev,
<<<<<<< HEAD
            selected_date: ['No hay disponibilidad los fines de semana'],
          }));
          return newData;
=======
            selected_date: t('errors.weekends'),
          }))
          return newData
>>>>>>> 27f780fc274471b5dba183f1564e2b9005079368
        }

        // Find available slots for this date and space
        const slots = getAvailableSlots(value, newData.space_id);
        setAvailableSchedules(slots);
        
        return {
          ...newData,
          start_time: '',
          end_time: '',
        };
      }

      // Reset end_time if start_time changes
      if (name === 'start_time' && value) {
        return {
          ...newData,
          end_time: '',
        };
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.space_id || !formData.selected_date || !formData.start_time || !formData.end_time) {
        setErrors({
          form: ['Todos los campos obligatorios deben ser completados'],
        });
        return;
      }

      // Validate that start time is before end time
      if (!isValidTimeRange(formData.start_time, formData.end_time)) {
        setErrors({
          form: ['La hora de fin debe ser posterior a la hora de inicio'],
        });
        return;
      }

      // Format date and time for API
      const startDateTime = `${formData.selected_date}T${formData.start_time}:00`;
      const endDateTime = `${formData.selected_date}T${formData.end_time}:00`;

      // Prepare data for API
      const bookingData = {
        space_id: formData.space_id,
        // user_id is not needed as it's taken from auth token in backend
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: formData.purpose || null,
        notes: formData.notes || null,
        status: 'pending' // Default status
      };

      let response;
      if (editingId) {
        response = await updateBooking(editingId, bookingData);
      } else {
        response = await createBooking(bookingData);
      }

      if (response) {
        if (editingId) {
          setEditingId(null);
        } else {
          setShowForm(false);
          setShowList(true);
        }
        setErrors({});
        fetchBookings();
      } 
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {};
      setErrors(apiErrors);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm.delete'))) {
      try {
        await deleteBooking(id);
        fetchBookings();
      } catch (error) {
        setError(error.message || 'Error al eliminar la reserva');
      }
    }
  };

  const handleShowForm = () => {
    setShowForm(true);
    setShowList(false);
    setEditingId(null);
  };

  const handleShowList = () => {
    setShowForm(false);
    setShowList(true);
  };

  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null);
      return;
    }
    
    setEditingId(id);
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) {
      console.error('Booking not found:', id);
      return;
    }
    
    // Format dates for form
    const startDate = new Date(booking.start_time);
    const formattedDate = startDate.toISOString().split('T')[0];
    const startTime = startDate.toTimeString().substring(0, 5);
    const endTime = new Date(booking.end_time).toTimeString().substring(0, 5);

    // Find the space and load available slots
    const space = spaces.find(s => s.id === booking.space_id);
    setSelectedSpace(space);
    
    setFormData({
      user_id: booking.user_id,
      space_id: booking.space_id,
      selected_date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      purpose: booking.purpose || '',
      notes: booking.notes || '',
    });

    // Calculate available slots for this date and space
    if (formattedDate && booking.space_id) {
      const slots = getAvailableSlots(formattedDate, booking.space_id, id);
      setAvailableSchedules(slots);
    }
  };
  
  // Helper function to determine day of week from date string
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    const days = [
      'sunday', 'monday', 'tuesday', 'wednesday', 
      'thursday', 'friday', 'saturday'
    ];
    return days[date.getUTCDay()];
  };

  // Helper function to parse space schedule format
  const parseSpaceSchedule = (scheduleStr) => {
    if (!scheduleStr) return [];
    return scheduleStr.split('|').map(slot => {
      const [day, start, end] = slot.split('-');
      return { day, start, end };
    });
  };

  // Convert time string to minutes for easier comparisons
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Check if time range is valid
  const isValidTimeRange = (start, end) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return startMinutes < endMinutes;
  };
  
  // Get available time slots for a specific date and space
  const getAvailableSlots = (date, spaceId, excludeBookingId = null) => {
    const numericSpaceId = Number(spaceId);
    const space = spaces.find(s => s.id === numericSpaceId);
    
    if (!space) return [];
    
    const dayOfWeek = getDayOfWeek(date);
    
    // Assuming spaces are not available on weekends
    if (['saturday', 'sunday'].includes(dayOfWeek)) return [];
    
    // Find schedules for this day of week
    const schedules = parseSpaceSchedule(space.schedule)
      .filter(s => s.day === dayOfWeek);
    
    if (schedules.length === 0) return [];
    
    const formattedDate = date;
    
    // Get bookings for this date and space, excluding the booking being edited
    const dateBookings = existingBookings.filter(b => {
      if (!b.space_id || b.space_id !== numericSpaceId) return false;
      
      // Skip the booking being edited
      if (excludeBookingId && b.id === excludeBookingId) return false;
      
      // Extract date from start_time to compare
      const bookingDate = new Date(b.start_time).toISOString().split('T')[0];
      return bookingDate === formattedDate;
    });
    
    // Calculate available time ranges
    const availableRanges = [];
    
    schedules.forEach(schedule => {
      // Convert schedule times to minutes for comparison
      const scheduleStartMinutes = timeToMinutes(schedule.start);
      const scheduleEndMinutes = timeToMinutes(schedule.end);
      
      // Create time points for analysis
      const timePoints = [
        { time: scheduleStartMinutes, type: 'start' },
        { time: scheduleEndMinutes, type: 'end' }
      ];
      
      // Add booking time points
      dateBookings.forEach(booking => {
        const startTime = new Date(booking.start_time).toTimeString().substring(0, 5);
        const endTime = new Date(booking.end_time).toTimeString().substring(0, 5);
        
        timePoints.push({
          time: timeToMinutes(startTime),
          type: 'booked-start'
        });
        
        timePoints.push({
          time: timeToMinutes(endTime),
          type: 'booked-end'
        });
      });
      
      // Sort chronologically
      timePoints.sort((a, b) => a.time - b.time);
      
      // Find available ranges
      let isAvailable = false;
      let rangeStart = null;
      
      timePoints.forEach(point => {
        if (point.type === 'start') {
          rangeStart = point.time;
          isAvailable = true;
        } else if (point.type === 'booked-start') {
          if (isAvailable && rangeStart !== null) {
            availableRanges.push({
              start: minutesToTime(rangeStart),
              end: minutesToTime(point.time)
            });
          }
          isAvailable = false;
        } else if (point.type === 'booked-end') {
          rangeStart = point.time;
          isAvailable = true;
        } else if (point.type === 'end') {
          if (isAvailable && rangeStart !== null) {
            availableRanges.push({
              start: minutesToTime(rangeStart),
              end: minutesToTime(point.time)
            });
          }
        }
      });
    });
    
    return availableRanges;
  };

  // Format date for display
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Get status display text
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': t('status.pending'),
      'completed': t('status.completed')
    };
    return statusMap[status] || status;
  };

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
      </div>
      
      {showList && (
        <>
          <div className="filter__buttons">
            <button 
              className={`filter-button ${bookingFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBookingFilter('all')}>
              {t('filters.all')}
            </button>
            <button 
              className={`filter-button ${bookingFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setBookingFilter('upcoming')}>
              {t('filters.upcoming')}
            </button>
            <button 
              className={`filter-button ${bookingFilter === 'past' ? 'active' : ''}`}
              onClick={() => setBookingFilter('past')}>
              {t('filters.past')}
            </button>
            <button 
              className={`filter-button ${bookingFilter === 'my' ? 'active' : ''}`}
              onClick={() => setBookingFilter('my')}>
              {t('filters.myBookings')}
            </button>
          </div>
          
          <section className="card__container">
            {loading && <p>{t('common.bookingsLoading')}</p>}
            {error && <p>{t('common.commonError', { error: error })}</p>}
            {!loading && !error && bookings.length === 0 && (
              <p>{t('common.bookingsNoBookings')}</p>
            )}
            
            {!loading && !error && bookings.map((booking) => (
              <React.Fragment key={booking.id}>
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
                        {formatDate(booking.start_time)} - {formatDate(booking.end_time)}
                      </p>
                      <p>
                        <span className="span--bold">{t('form.status.label')}: </span>
                        {getStatusDisplay(booking.status)}
                      </p>
                      {booking.purpose && (
                        <p>
                          <span className="span--bold">{t('form.purpose.label')}: </span>
                          {booking.purpose}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="card__buttons">
                    <button
                      className="form__submit --noArrow"
                      onClick={() => handleEditClick(booking.id)}
                    >
                      {t('actions.edit')}
                    </button>
                    <button 
                      className="form__submit --noArrow"
                      onClick={() => handleDelete(booking.id)}
                    >
                      {t('actions.delete')}
                    </button>
                  </div>
                </article>
                
                {editingId === booking.id && (
                  <article className="card--form--edit">
                    <form onSubmit={handleSubmit}>
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
                          <option value="">{t('form.space.placeholder')}</option>
                          {spaces.map((space) => (
                            <option key={space.id} value={space.id}>
                              {space.subtitle} ({space.price}€ - {space.places} {t('form.seats.label')})
                            </option>
                          ))}
                        </select>
                        {errors.space_id && errors.space_id.map((err, idx) => (
                          <span className="form__error" key={idx}>
                            {err}
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
                        {errors.selected_date && errors.selected_date.map((err, idx) => (
                          <span className="form__error" key={idx}>
                            {err}
                          </span>
                        ))}
                      </div>

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
                            <label htmlFor="start_time">
                              {t('form.time.startTime')}:
                            </label>
                            <input
                              type="time"
                              id="start_time"
                              name="start_time"
                              value={formData.start_time}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="form__section">
                            <label htmlFor="end_time">
                              {t('form.time.endTime')}:
                            </label>
                            <input
                              type="time"
                              id="end_time"
                              name="end_time"
                              value={formData.end_time}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </>
                      )}
                      
                      {formData.selected_date && availableSchedules.length === 0 && (
                        <div className="form__section">
                          <p className="form__error">
                            {t('form.date.noSlot')}
                          </p>
                        </div>
                      )}
                      
                      <div className="form__section">
                        <label htmlFor="purpose">
                          {t('form.purpose.label')}:
                        </label>
                        <input
                          type="text"
                          id="purpose"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="form__section">
                        <label htmlFor="notes">
                          {t('form.notes.label')}:
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows="3"
                        ></textarea>
                      </div>

                      {errors.form && errors.form.map((err, idx) => (
                        <span className="form__error" key={idx}>
                          {err}
                        </span>
                      ))}
                      
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
          
          {!loading && !error && bookings.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <img src={arrowTopito} className="arrowTopito--left" alt="First page" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <img src={arrow} className="arrow--left" alt="Previous page" />
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <img src={arrow} className="arrow--right" alt="Next page" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <img src={arrowTopito} className="arrowTopito--right" alt="Last page" />
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
                {errors.space_id && errors.space_id.map((err, idx) => (
                  <span className="form__error" key={idx}>
                    {err}
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
                          return dayOrder[a.day] - dayOrder[b.day];
                        }
                        return a.start.localeCompare(b.start);
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
                  {errors.selected_date && errors.selected_date.map((err, idx) => (
                    <span className="form__error" key={idx}>
                      {err}
                    </span>
                  ))}
                </div>
              )}
              
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
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                    />
                    {errors.start_time && errors.start_time.map((err, idx) => (
                      <span className="form__error" key={idx}>
                        {err}
                      </span>
                    ))}
                  </div>

                  <div className="form__section">
                    <label htmlFor="end_time">{t('form.time.endTime')}: </label>
                    <input
                      type="time"
                      id="end_time"
                      name="end_time" 
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                    />
                    {errors.end_time && errors.end_time.map((err, idx) => (
                      <span className="form__error" key={idx}>
                        {err}
                      </span>
                    ))}
                  </div>
                </>
              )}
              
              {formData.selected_date && availableSchedules.length === 0 && (
                <div className="form__section">
                  <p className="form__error">
                    {t('form.date.noSlot')}
                  </p>
                </div>
              )}
              
              <div className="form__section">
                <label htmlFor="purpose">{t('form.purpose.label')}: </label>
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder={t('form.purpose.placeholder')}
                />
              </div>
              
              <div className="form__section">
                <label htmlFor="notes">{t('form.notes.label')}: </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder={t('form.notes.placeholder')}
                ></textarea>
              </div>
              
              {errors.form && errors.form.map((err, idx) => (
                <span className="form__error" key={idx}>
                  {err}
                </span>
              ))}
              
              <input
                type="submit"
                value={t('actions.bookingsCreate')}
                className="form__submit"
              />
            </form>
          </article>
        </section>
      )}
    </>
  )
}

export default BookingList
