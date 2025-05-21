import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import leonardo from '../assets/img/leonardo.svg'
import { getAudits } from '../services/apiService'

const AuditList = () => {
  const { t } = useTranslation()
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const perPage = 3

  useEffect(() => {
    const fetchAudits = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAudits(currentPage, perPage)
        const auditsArray = data?.data?.data || []
        setAudits(auditsArray)
        setTotalPages(data?.data?.last_page || 1)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAudits()
  }, [currentPage])

  return (
    <>
      <h3>{t('links.audits')}</h3>
      <section className="card__container">
        {loading && <p>{t('common.auditsLoading')}</p>}
        {error && <p>{t('common.commonError', { error: error })}</p>}
        {!loading && !error && audits.length === 0 && (
          <p>{t('common.auditsNoAudits')}</p>
        )}
        {!loading &&
          !error &&
          audits.map((audit) => (
            <article className="card" key={audit.id}>
              <div className="card__content">
                <img
                  src={leonardo}
                  alt={t('alt.dashboardImg', { id: audit.id })}
                  title={t('common.dashboardImg', { id: audit.id })}
                  className="card__img"
                />
                <div className="card__text">
                  <p>{t('common.user')}: {audit.admin?.email || audit.admin_id}</p>
                  <p>{t('common.action')}: {audit.action}</p>
                  <p>{t('common.table')}: {audit.table_name}</p>
                </div>
              </div>
            </article>          ))}
      </section>
      {!loading && !error && audits.length > 0 && (
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

export default AuditList
