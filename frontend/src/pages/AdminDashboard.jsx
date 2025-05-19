import { useState } from 'react';
import { useTranslation } from 'react-i18next'

import UserList from '../components/UserList'
import SpaceList from '../components/SpaceList'
import BookingList from '../components/BookingList'
import SuscriptionList from '../components/SuscriptionList'
import CompletedPaymentList from '../components/CompletedPaymentList'
import PendingPaymentList from '../components/PendingPaymentList'
import AuditList from '../components/AuditList'

import leonardo from '../assets/img/leonardo.svg'

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState({
    users: false,
    spaces: false,
    bookings: false,
    subscriptions: false,
    completedPayments: false,
    pendingPayments: false,
    audits: false
  });

  const toggleSection = (section) => {
    setActiveSection(prev => ({
      users: false,
      spaces: false,
      bookings: false,
      subscriptions: false,
      completedPayments: false,
      pendingPayments: false,
      audits: false,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <section className='user__background'>
        <article className='user__section'>
          <img src={leonardo} className='user__img' alt={t('alt.login_img')}></img>
          <h1>Hola, Leonardo, ¿En qué trabajamos hoy?</h1>
        </article>
      </section>

      <section className='user__section--part'>
        <h2>Principal</h2>
        <article className='user__buttons'>
          <button 
            className={`form__submit ${activeSection.users ? 'active' : ''}`}
            onClick={() => toggleSection('users')}
          >
            Usuarios
          </button>
          <button 
            className={`form__submit ${activeSection.spaces ? 'active' : ''}`}
            onClick={() => toggleSection('spaces')}
          >
            Espacios
          </button>
          <button 
            className={`form__submit ${activeSection.bookings ? 'active' : ''}`}
            onClick={() => toggleSection('bookings')}
          >
            Reservas
          </button>
        </article>
        <article>
          <section className={`dropdown__container ${activeSection.users ? 'open' : ''}`}>
            <UserList />
          </section>
          <section className={`dropdown__container ${activeSection.spaces ? 'open' : ''}`}>
          <SpaceList />
          </section>
          <section className={`dropdown__container ${activeSection.bookings ? 'open' : ''}`}>
            <BookingList />
          </section>
        </article>
      </section>

      <section className='user__section--part'>
        <h2>Pagos</h2>
        <article className='user__buttons'>
          <button 
            className={`form__submit ${activeSection.subscriptions ? 'active' : ''}`}
            onClick={() => toggleSection('subscriptions')}
          >
            Suscripciones
          </button>
          <button 
            className={`form__submit ${activeSection.completedPayments ? 'active' : ''}`}
            onClick={() => toggleSection('completedPayments')}
          >
            Pagos realizados
          </button>
          <button 
            className={`form__submit ${activeSection.pendingPayments ? 'active' : ''}`}
            onClick={() => toggleSection('pendingPayments')}
          >
            Pagos pendientes
          </button>
        </article>
        <article>
          <section className={`dropdown__container ${activeSection.subscriptions ? 'open' : ''}`}>
            <SuscriptionList />
          </section>
          <section className={`dropdown__container ${activeSection.completedPayments ? 'open' : ''}`}>
            <CompletedPaymentList />
          </section>
          <section className={`dropdown__container ${activeSection.pendingPayments ? 'open' : ''}`}>
            <PendingPaymentList />
          </section>
        </article>
      </section>

      <section className='user__section--part'>
        <h2>Gestión de la web</h2>
        <article className='user__buttons'>
          <button 
            className={`form__submit ${activeSection.audits ? 'active' : ''}`}
            onClick={() => toggleSection('audits')}
          >
            Auditorias
          </button>
          <button className='form__submit --noArrow'>
            Copia de seguridad manual
          </button>
        </article>
        <article>
          <section className={`dropdown__container ${activeSection.audits ? 'open' : ''}`}>
            <AuditList />
          </section>
        </article>
      </section>
    </>
  );
};

export default AdminDashboard;