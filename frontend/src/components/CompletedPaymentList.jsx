import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getCompletedPayments } from '../services/apiService'

import leonardo from '../assets/img/leonardo.svg'

const CompletedPaymentList = () => {
  const { t } = useTranslation()
  const [showList, setShowList] = useState(true)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCompletedPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCompletedPayments()
      // Check if the data is paginated and extract the payments from the "data" property
      if (data && typeof data === 'object' && Array.isArray(data.data)) {
        setPayments(data.data) // Set only the payments array from the paginated data
      } else {
        setPayments(data) // Fallback to the original behavior if data is not paginated
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchCompletedPayments()
    }
  }, [showList])

  return (
    <>
      <h3>{t('links.completedPayments')}</h3>
      <section className="card__container">
        {loading && <p>{t('common.paymentsLoading')}</p>}
        {error && <p>{t('common.commonError', { error: error })}</p>}
        {!loading && !error && payments.length === 0 && (
          <p>{t('common.paymentsNoPayments')}</p>
        )}
        {!loading &&
          !error &&
          payments.map((payment) => (
            <React.Fragment key={payment.id}>
              <article className="card">
                <div className="card__content">
                  <img
                    src={leonardo}
                    alt={t('alt.dashboardImg', { id: payment.id })}
                    title={t('common.dashboardImg', { id: payment.id })}
                    className="card__img"
                  />
                  <div className="card__text">
                    {payment.user && (
                      <>
                        <p>
                          {payment.user.name} {payment.user.surname}
                        </p>
                        <p>{payment.user.email}</p>
                      </>
                    )}
                    <p>{t('common.amount')}: {payment.amount}</p>
                    <p>{t('common.date')}: {new Date(payment.created_at || payment.date).toLocaleDateString()}</p>
                    <p>{t('common.status')}: {payment.status}</p>
                  </div>
                </div>
              </article>
            </React.Fragment>
          ))}
      </section>
    </>
  )
}

export default CompletedPaymentList
