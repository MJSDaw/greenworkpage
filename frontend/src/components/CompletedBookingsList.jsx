import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setAuthToken, authenticatedFetch } from '../services/authService'

import leonardo from '../assets/img/leonardo.svg'

const CompletedBookingList = () => {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [showList, setShowList] = useState(true)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // TODO: Organiza esto porfi
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authenticatedFetch('/api/admin/users', {
        method: 'GET',
      })
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios')
      }
      const data = await response.json()
      // Check if the data is paginated and extract the users from the "data" property
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setUsers(data.data) // Set only the users array from the paginated data
      } else {
        setUsers(data) // Fallback to the original behavior if data is not paginated
      }
    } catch (err) {
      setError(err.message)
      console.error('Error al obtener usuarios:', err) // TODO: Esto me lo quitas de consola porfi
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchUsers()
    }
  }, [showList])

  return (
    <>
      <h3>{t('links.completedBookings')}</h3>
      <section className="card__container">
        {loading && <p>{t('common.bookingsLoading')}</p>}
        {error && <p>{t('common.commonError', { error: error })}</p>}
        {!loading && !error && users.length === 0 && (
          <p>{t('common.bookingsNoBookings')}</p>
        )}
        {!loading &&
          !error &&
          users.map((user) => (
            <React.Fragment key={user.id}>
              <article className="card">
                <div className="card__content">
                  <img
                    src={leonardo}
                    alt={t('alt.dashboardImg', { id: user.id })}
                    title={t('common.dashboardImg', { id: user.id })}
                    className="card__img"
                  />
                  <div className="card__text">
                    <p>
                      {user.name} {user.surname}
                    </p>
                    <p>{user.email}</p>
                  </div>
                </div>
              </article>
            </React.Fragment>
          ))}
      </section>
    </>
  )
}

export default CompletedBookingList
