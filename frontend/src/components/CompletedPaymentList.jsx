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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3

  const fetchCompletedPayments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCompletedPayments(currentPage, perPage)
      
      // Extract the payments array from the paginated response
      const paymentsArray = response?.data?.data || []
      setPayments(paymentsArray)
      
      // Set pagination data
      setTotalPages(response?.data?.last_page || 1)
    } catch (err) {
      setError(err.message || 'Error al obtener pagos completados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (showList) {
      fetchCompletedPayments()
    }
  }, [showList, currentPage])

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
                </div>              </article>
            </React.Fragment>
          ))}
          {!loading && !error && payments.length > 0 && (
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
      </section>
    </>
  )
}

export default CompletedPaymentList
