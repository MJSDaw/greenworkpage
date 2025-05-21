import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getCompletedPayments } from '../services/apiService'

import arrowTopito from '../assets/img/arrowTopito.svg'
import arrow from '../assets/img/arrow.svg'

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
                  <div className="card__text">
                    {payment.user && (
                      <>
                        <p><span className='span--bold'>{t('form.name.label')}: </span>{payment.user.name} {payment.user.surname}</p>
                        <p><span className='span--bold'>{t('form.email.label')}: </span>{payment.user.email}</p>
                      </>
                    )}
                    <p><span className='span--bold'>{t('form.amount.label')}: </span>{payment.amount}€
                    </p>
                    <p>
                      <span className='span--bold'>{t('form.datePayment.label')}: </span>
                      {new Date(
                        payment.created_at || payment.date
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className='span--bold'>{t('form.status.label')}: </span>
                      {payment.status === 'completed' ? t('form.status.completed') : t('form.status.pending') }
                    </p>
                  </div>
                </div>{' '}
              </article>
            </React.Fragment>
          ))}
      </section>
      {!loading && !error && payments.length > 0 && (
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

export default CompletedPaymentList
