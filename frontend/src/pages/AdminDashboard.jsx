import { useState, useEffect } from 'react';

import { useTranslation } from 'react-i18next'

import UserList from '../components/UserList'
import SpaceList from '../components/SpaceList'
import BookingList from '../components/BookingList'
import SuscriptionList from '../components/SuscriptionList'
import CompletedPaymentList from '../components/CompletedPaymentList'
import PendingPaymentList from '../components/PendingPaymentList'
import AuditList from '../components/AuditList'

import defaultImage from '../assets/img/leonardo.svg'

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');

  const [activeSection, setActiveSection] = useState({
    users: false,
    spaces: false,
    bookings: false,
    subscriptions: false,
    completedPayments: false,
    pendingPayments: false,
    audits: false,
  })
  const [image, setImage] = useState(defaultImage)

  useEffect(() => {
    // Get username from userData in local storage
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData && parsedUserData.name) {
          setUserName(parsedUserData.name);
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const toggleSection = (section) => {
    setActiveSection((prev) => ({
      users: false,
      spaces: false,
      bookings: false,
      subscriptions: false,
      completedPayments: false,
      pendingPayments: false,
      audits: false,
      [section]: !prev[section],
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
    }
  }

  return (
    <>
      <section className="user__background">
        <article className="user__section">
          <div className="user__img__container">
            <img
              src={image}
              className="user__img"
              alt={t('alt.dashboardImg')}
              title={t('common.dashboardImg')}
            />
            <label className="user__edit__btn">
              {t('actions.editImg')}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
          <h1>{t('common.greetings', { name: userName || 'Usuario' })}</h1>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('common.main')}</h2>
        <article className="user__buttons">
          <button
            className={`form__submit ${activeSection.users ? 'active' : ''}`}
            onClick={() => toggleSection('users')}
          >
            {t('links.users')}
          </button>
          <button
            className={`form__submit ${activeSection.spaces ? 'active' : ''}`}
            onClick={() => toggleSection('spaces')}
          >
            {t('links.spaces')}
          </button>
          <button
            className={`form__submit ${activeSection.bookings ? 'active' : ''}`}
            onClick={() => toggleSection('bookings')}
          >
            {t('links.bookings')}
          </button>
        </article>
        <article>
          <section
            className={`dropdown__container ${activeSection.users ? 'open' : ''}`}
          >
            <UserList />
          </section>
          <section
            className={`dropdown__container ${activeSection.spaces ? 'open' : ''}`}
          >
            <SpaceList />
          </section>
          <section
            className={`dropdown__container ${activeSection.bookings ? 'open' : ''}`}
          >
            <BookingList />
          </section>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('links.payments')}</h2>
        <article className="user__buttons">
          <button
            className={`form__submit ${activeSection.subscriptions ? 'active' : ''}`}
            onClick={() => toggleSection('subscriptions')}
          >
            {t('links.suscriptions')}
          </button>
          <button
            className={`form__submit ${activeSection.completedPayments ? 'active' : ''}`}
            onClick={() => toggleSection('completedPayments')}
          >
            {t('links.completedPayments')}
          </button>
          <button
            className={`form__submit ${activeSection.pendingPayments ? 'active' : ''}`}
            onClick={() => toggleSection('pendingPayments')}
          >
            {t('links.pendingPayments')}
          </button>
        </article>
        <article>
          <section
            className={`dropdown__container ${activeSection.subscriptions ? 'open' : ''}`}
          >
            <SuscriptionList />
          </section>
          <section
            className={`dropdown__container ${activeSection.completedPayments ? 'open' : ''}`}
          >
            <CompletedPaymentList />
          </section>
          <section
            className={`dropdown__container ${activeSection.pendingPayments ? 'open' : ''}`}
          >
            <PendingPaymentList />
          </section>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('common.management')}</h2>
        <article className="user__buttons">
          <button
            className={`form__submit ${activeSection.audits ? 'active' : ''}`}
            onClick={() => toggleSection('audits')}
          >
            {t('links.audits')}
          </button>
          <button className="form__submit --noArrow">
            {t('links.backup')}
          </button>
        </article>
        <article>
          <section
            className={`dropdown__container ${activeSection.audits ? 'open' : ''}`}
          >
            <AuditList />
          </section>
        </article>
      </section>
    </>
  )
}

export default AdminDashboard
