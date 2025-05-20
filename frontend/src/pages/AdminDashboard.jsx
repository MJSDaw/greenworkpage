import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserData } from '../services/authService'
import { createBackup } from '../services/apiService'
import UserList from '../components/UserList'
import SpaceList from '../components/SpaceList'
import BookingList from '../components/BookingList'
import CompletedBookingList from '../components/CompletedBookingsList'
import AuditList from '../components/AuditList'
import PendingPaymentList from '../components/PendingPaymentList'
import CompletedPaymentList from '../components/CompletedPaymentList'

import defaultImage from '../assets/img/leonardo.svg'

const AdminDashboard = () => {
  const { t } = useTranslation()
  const [userName, setUserName] = useState('')

  const [activeSection, setActiveSection] = useState({
    users: false,
    spaces: false,
    bookings: false,
    subscriptions: false,
    completedPayments: false,
    pendingPayments: false,
    audits: false,
  })
  // Iniciar con defaultImage solo si no hay imagen de usuario
  const [image, setImage] = useState(defaultImage)
  // useEffect(() => {
  //   // Get admin data from local storage
  //   const adminData = getUserData()

  //   if (adminData) {
  //     // Set username
  //     if (adminData.name) {
  //       setUserName(adminData.name)
  //     }
  //     // Set profile image
  //     if (adminData.image) {
  //       // If the image is a full URL
  //       if (adminData.image.startsWith('http')) {
  //         setImage(adminData.image)
  //       } else {
  //         // If it's a relative path, assume it's from storage
  //         setImage(`https://localhost:8443/storage/${adminData.image}`)
  //       }
  //     } else {
  //       // Si no hay imagen, usar la imagen predeterminada
  //       setImage(defaultImage)
  //     }

  //     // Fetch latest admin data to ensure we have the most current info
  //     const fetchAdminData = async () => {
  //       try {
  //         const updatedData = await getUserProfile()
  //         if (updatedData) {
  //           // Update image if it exists in response
  //           if (updatedData.image) {
  //             if (updatedData.image.startsWith('http')) {
  //               setImage(updatedData.image)
  //             } else {
  //               setImage(
  //                 `https://localhost:8443/storage/${updatedData.image}`
  //               )
  //             }
  //           } else {
  //             // Si no hay imagen en los datos actualizados, usar la predeterminada
  //             setImage(defaultImage)
  //           }
  //         }
  //       } catch (error) {
  //         console.error('Error fetching admin data:', error)
  //       }
  //     }

  //     fetchAdminData()
  //   }
  // }, [])

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
  // const handleImageChange = async (e) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   // Validar el archivo (opcional)
  //   if (file.size > 2 * 1024 * 1024) {
  //     console.error('La imagen es demasiado grande. El tamaño máximo es 2MB.')
  //     return
  //   }

  //   // Crear preview de la imagen
  //   const url = URL.createObjectURL(file)
  //   setImage(url) // Mostrar preview inmediato

  //   // Obtener ID del administrador
  //   const adminData = getUserData()

  //   if (!adminData || !adminData.id) {
  //     console.error('No se pudo encontrar la información del administrador')
  //     return
  //   }

  //   try {
  //     // Enviar imagen al servidor usando el servicio centralizado
  //     const data = await updateAdminImage(adminData.id, file)
      
  //     if (data && data.success) {
  //       console.log('Imagen actualizada con éxito:', data)
  //       // Actualizar la imagen con la ruta devuelta por el servidor
  //       // La ruta será algo como: admin-images/chrlE8EyTTqy1BHuuDkuGm0AF9rPkd28I4PXHYbT.jpg
  //       if (data.data && data.data.image) {
  //         // Construir la URL correcta para acceder al archivo en el storage público
  //         setImage(`https://localhost:8443/storage/${data.data.image}`)
  //         // También actualizamos la información del admin en localStorage
  //         const currentAdminData = getUserData()
  //         if (currentAdminData) {
  //           currentAdminData.image = data.data.image
  //           localStorage.setItem('userData', JSON.stringify(currentAdminData))
  //         }
  //       }
  //     } else {
  //       console.error(
  //         'Error al actualizar la imagen:',
  //         data.message || 'Error desconocido'
  //       )
  //       // Puedes mostrar un mensaje al usuario aquí
  //     }
  //   } catch (error) {
  //     console.error('Error al enviar la imagen al servidor:', error)
  //   }
  // }

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
          <button
            className={`form__submit ${activeSection.completedBookings ? 'active' : ''}`}
            onClick={() => toggleSection('completedBookings')}
          >
            {t('links.completedBookings')}
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
          <section
            className={`dropdown__container ${activeSection.completedBookings ? 'open' : ''}`}
          >
            <CompletedBookingList />
          </section>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('links.payments')}</h2>
        <article className="user__buttons">
          <button
            className={`form__submit ${activeSection.pendingPayments ? 'active' : ''}`}
            onClick={() => toggleSection('pendingPayments')}
          >
            {t('links.pendingPayments')}
          </button>
          <button
            className={`form__submit ${activeSection.completedPayments ? 'active' : ''}`}
            onClick={() => toggleSection('completedPayments')}
          >
            {t('links.completedPayments')}
          </button>
        </article>
        <article>
          <section
            className={`dropdown__container ${activeSection.pendingPayments ? 'open' : ''}`}
          >
            <PendingPaymentList />
          </section>
          <section
            className={`dropdown__container ${activeSection.completedPayments ? 'open' : ''}`}
          >
            <CompletedPaymentList />
          </section>
        </article>
      </section>

      <section className="user__section--part">
        <h2>{t('common.management')}</h2>
        <article className="user__buttons">          <button
            className={`form__submit ${activeSection.audits ? 'active' : ''}`}
            onClick={() => toggleSection('audits')}
          >
            {t('links.audits')}
          </button>
          <button 
            className="form__submit --noArrow"
            onClick={async () => {
              try {
                const response = await createBackup();
                console.log('Backup response:', response);
                // Aquí podríamos hacer algo con la respuesta si es necesario
                // pero sin mostrar alertas
              } catch (error) {
                console.error('Error creating backup:', error);
              }
            }}
          >
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
