import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import leonardo from '../assets/img/leonardo.svg'
import { getCompletedBookings } from '../services/apiService'

const BookingList = () => {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCompletedBookings()
        const bookingsArray = data?.data?.data || []
        setBookings(bookingsArray)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

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
            <article className="card" key={booking.id || `${booking.user_id}-${booking.space_id}-${booking.reservation_period}` }>
              <div className="card__content">
                <div className="card__text">
                  <p>
                    {t('common.user')}: {booking.user?.name || booking.user_id}
                  </p>
                  <p>
                    {t('common.space')}: {booking.space?.subtitle || booking.space_id}
                  </p>
                  <p>
                    {t('common.period')}: {booking.start_date || booking.reservation_period?.split('|')[0]} - {booking.end_date || booking.reservation_period?.split('|')[1]}
                  </p>
                </div>
              </div>
            </article>
          ))}
      </section>
    </>
  )
}

export default BookingList
