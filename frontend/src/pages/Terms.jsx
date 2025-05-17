import React from 'react'
import { useTranslation } from 'react-i18next'
import ContactUs from '../components/ContactUs'

const Terms = () => {
  const { t } = useTranslation()
  return (
    <>
      <main className="terms__background">
        <section className="terms">
          <h1 className="h1--left">{t('common.terms')}</h1>
          <article className="white__container--terms">
            <h2>{t('terms.title1')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg1') }} />
            <h2>{t('terms.title2')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg2') }} />
            <h2>{t('terms.title3')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg3') }} />
            <h2>{t('terms.title4')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg4') }} />
            <h2>{t('terms.title5')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg5') }} />
            <h2>{t('terms.title6')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('terms.msg6') }} />
          </article>
        </section>
      </main>
      <ContactUs />
    </>
  )
}

export default Terms
