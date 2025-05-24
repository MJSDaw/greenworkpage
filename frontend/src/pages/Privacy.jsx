import React from 'react'
import { useTranslation } from 'react-i18next'
import ContactUs from '../components/ContactUs'

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <>
      <main className="terms__background">
        <section className="terms">
          <h1 className="h1--left">{t('common.privacy')}</h1>
          <article className="white__container--terms">
            <h2>{t('privacy.title1')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg1').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title2')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg2').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title3')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg3').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title4')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg4').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title5')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg5').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title6')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg6').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title7')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg7').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title8')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg8').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title9')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg9').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title10')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg10').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title11')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg11').replace(/\n/g, '<br>') }} />
            <h2>{t('privacy.title12')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('privacy.msg12').replace(/\n/g, '<br>') }} />
          </article>
        </section>
      </main>
      <ContactUs />
    </>
  );
};

export default Privacy
