import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getCompletedBookings } from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

const BookingList = () => {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCompletedBookings(currentPage, perPage)
      // Extract the bookings array from the paginated response
      const bookingsArray = response?.data?.data || []
      setBookings(bookingsArray)
      // Set pagination data
      setTotalPages(response?.data?.last_page || 1)
    } catch (err) {
      setError(err.message || 'Error al obtener reservas completadas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentPage])

  return (
    <>
      <h3>{t('links.bookings')}</h3>
      <section className="card__container">
        {loading && <p>{t('common.bookingsLoading')}</p>}
        {error && <p>{t('common.commonError', { error: error })}</p>}
        {!loading && !error && bookings.length === 0 && (
          <p>{t('common.bookingsNoBookings')}</p>
        )}
        {!loading &&
          !error &&
          bookings.map((booking) => (
            <article
              className="card"
              key={
                booking.id ||
                `${booking.user_id}-${booking.space_id}-${booking.reservation_period}`
              }
            >
              <div className="card__content">
                <div className="card__text">
                  <p><span className='span--bold'>{t('form.user.label')}: </span>{booking.user.name}</p>
                  <p><span className='span--bold'>{t('form.space.label')}: </span>{booking.space.subtitle}</p>
                  <p>
                    <span className='span--bold'>{t('form.period.label')}: </span>
                    {booking.start_date ||
                      booking.reservation_period?.split('|')[0]}{' '}
                    -{' '}
                    {booking.end_date ||
                      booking.reservation_period?.split('|')[1]}
                  </p>{' '}
                </div>
              </div>
            </article>
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
  )
}

export default BookingList
