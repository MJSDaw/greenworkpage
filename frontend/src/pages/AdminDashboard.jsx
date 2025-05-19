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
  const { t } = useTranslation()
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
          <button className='form__submit'>
            Usuarios
            </button>
            <button className='form__submit'>
              Espacios
            </button>
            <button className='form__submit'>
              Reservas
            </button>
          </article>
          <article >
            <UserList />
            <SpaceList />
            <BookingList />
          </article>
        </section>

        <section className='user__section--part'>
          <h2>Pagos</h2>
          <article className='user__buttons'>
            <button className='form__submit'>
              Suscripciones
            </button>
            <button className='form__submit'>
              Pagos realizados
            </button>
            <button className='form__submit'>
              Pagos pendientes
            </button>
          </article>
          <article >
            <SuscriptionList />
            <CompletedPaymentList />
            <PendingPaymentList />
          </article>
        </section>

        <section className='user__section--part'>
          <h2>Gestión de la web</h2>
          <article className='user__buttons'>
            <button className='form__submit'>
              Auditorias
            </button>
            <button className='form__submit'>
              Copia de seguridad manual
            </button>
          </article>
          <article >
            <AuditList />
          </article>
        </section>
    </>
  )
}

export default AdminDashboard
