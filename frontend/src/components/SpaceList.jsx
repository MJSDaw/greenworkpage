import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { setAuthToken } from '../services/authService'
import { getSpaces, saveSpace } from '../services/apiService'

import leonardo from '../assets/img/leonardo.svg'

const SpaceList = () => {  
  const { t } = useTranslation();
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    day: 'monday',
    startTime: '',
    endTime: ''
  });
  
  const [formData, setFormData] = useState({
    places: '',
    price: '',
    schedule: '',
    images: '',
    description: '',
    subtitle: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 3;

  const fetchSpaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSpaces();
      // Check if the data is paginated and extract the spaces from the "data" property
      if (response && typeof response === 'object' && Array.isArray(response.data)) {
        setSpaces(response.data); // Set only the spaces array from the paginated data
        setTotalPages(response.last_page || 1); // Set total pages from the pagination metadata
      } else if (Array.isArray(response)) {
        setSpaces(response); // Fallback to the original behavior if data is not paginated
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);    
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchSpaces()
    }
  }, [showList, currentPage])
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await saveSpace(formData, editingId);
      
      if (data && data.status === 'success') {
        if (editingId) {
          setEditingId(null);
          setErrors({});
        } else {
          setErrors({});
          setShowForm(false);
          setShowList(true);
        }
        fetchSpaces(); // Reload the spaces list
      } else {
        setErrors(data.errors || {});
      }
    } catch (error) {
      setErrors(error.errors || {});
    }
  };

  const handleShowForm = () => {
    setShowForm(true)
    setShowList(false)
  }

  const handleShowList = () => {
    setShowForm(false)
    setShowList(true)
  }

  // Schedule validation and handling functions
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const hasTimeOverlap = (newStart, newEnd, day) => {
    const newStartMinutes = timeToMinutes(newStart);
    const newEndMinutes = timeToMinutes(newEnd);

    return scheduleEntries.some(entry => {
      if (entry.day !== day) return false;
      const existingStartMinutes = timeToMinutes(entry.startTime);
      const existingEndMinutes = timeToMinutes(entry.endTime);

      return (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes);
    });
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const { day, startTime, endTime } = scheduleForm;

    if (!day || !startTime || !endTime) {
      setErrors(prev => ({
        ...prev,
        schedule: ['All schedule fields are required']
      }));
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setErrors(prev => ({
        ...prev,
        schedule: ['End time must be after start time']
      }));
      return;
    }

    if (hasTimeOverlap(startTime, endTime, day)) {
      setErrors(prev => ({
        ...prev,
        schedule: ['Time overlaps with existing schedule']
      }));
      return;
    }

    setScheduleEntries(prev => [...prev, { day, startTime, endTime }]);
    setScheduleForm({
      day: 'monday',
      startTime: '',
      endTime: ''
    });
    
    // Update formData.schedule with the new format
    const updatedEntries = [...scheduleEntries, { day, startTime, endTime }];
    const scheduleString = updatedEntries
      .map(entry => `${entry.day}-${entry.startTime}-${entry.endTime}`)
      .join('|');
    
    setFormData(prev => ({
      ...prev,
      schedule: scheduleString
    }));
  };

  const handleRemoveSchedule = (index) => {
    const newEntries = scheduleEntries.filter((_, i) => i !== index);
    setScheduleEntries(newEntries);
    
    const scheduleString = newEntries
      .map(entry => `${entry.day}-${entry.startTime}-${entry.endTime}`)
      .join('|');
    
    setFormData(prev => ({
      ...prev,
      schedule: scheduleString
    }));
  };

  const [editingId, setEditingId] = useState(null)
  // TODO: usalo para cargar el resto de atributos pertinentes
  const handleEditClick = (id) => {
    if (editingId === id) {
      setEditingId(null)
    } else {
      setEditingId(id);
      const spaceToEdit = spaces.find((space) => space.id === id)
      
      // Parse the schedule string into entries
      const schedules = spaceToEdit.schedule ? spaceToEdit.schedule.split('|').map(schedule => {
        const [day, startTime, endTime] = schedule.split('-');
        return { day, startTime, endTime };
      }) : [];
      
      setScheduleEntries(schedules);
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
                  <div className="card__content">                    <div className="card__text">
                      <p>{space.subtitle}</p>
                      <p>{space.price}€ - {space.places} {t('common.places')}</p>                      <ul className="schedule-display">
                        {space.schedule.split('|')
                          .map(schedule => {
                            const [day, start, end] = schedule.split('-');
                            return { day, start, end };
                          })
                          .sort((a, b) => {
                            // Primero ordenar por día                            
                            const dayOrder = {
                              monday: 1,
                              tuesday: 2,
                              wednesday: 3,
                              thursday: 4,
                              friday: 5
                            };
                            if (dayOrder[a.day] !== dayOrder[b.day]) {
                              return dayOrder[a.day] - dayOrder[b.day];
                            }
                            // Si es el mismo día, ordenar por hora de inicio
                            return a.start.localeCompare(b.start);
                          })
                          .map((schedule, index) => (
                            <li key={index}>
                              {schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)}: {schedule.start} - {schedule.end}
                            </li>
                          ))
                        }
                      </ul>
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
                        <label>{t('form.schedule.label')}</label>
                        <div className="schedule-form">
                          <select
                            name="day"
                            value={scheduleForm.day}
                            onChange={handleScheduleChange}
                          >
                            {daysOfWeek.map(day => (
                              <option key={day} value={day}>
                                {day.charAt(0).toUpperCase() + day.slice(1)}
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
                                  {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}:
                                  {' '}{entry.startTime} - {entry.endTime}
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
                      <div className="form__section">
                        <label htmlFor="images">
                          {t('form.images.label')}
                        </label>
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
      )}
      {showForm && (
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
                <label>{t('form.schedule.label')}</label>
                <div className="schedule-form">
                  <select
                    name="day"
                    value={scheduleForm.day}
                    onChange={handleScheduleChange}
                  >
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
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
                          {entry.day.charAt(0).toUpperCase() + entry.day.slice(1)}:
                          {' '}{entry.startTime} - {entry.endTime}
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
      {!loading && !error && spaces.length > 0 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('common.previous')}
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('common.next')}
              </button>
            </div>
          )}
    </>
  )
}

export default SpaceList
