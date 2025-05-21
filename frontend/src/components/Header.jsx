import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAuthenticated, removeAuthToken } from '../services/authService'
import { getUserProfile } from '../services/authService'
import logo from '../assets/img/logo.png'
import menuHamburger from '../assets/img/menu_hamburguer.svg'
import leonardo from '../assets/img/leonardo.svg'

const Header = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [menuActive, setMenuActive] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const menuRef = useRef(null)
  const [userImage, setUserImage] = useState(leonardo) // Inicializar con la imagen por defecto

  useEffect(() => {
    setAuthenticated(isAuthenticated())
    // Get username from userData in local storage
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const parsedUserData = JSON.parse(userData)
        if (parsedUserData && parsedUserData.name) {
          setUserName(parsedUserData.name)
        }

        if (userData.name) {
          setUserName(userData.name)
        }

        const fetchUserData = async () => {
          try {
            const updatedData = await getUserProfile()
            if (updatedData) {
              // Update image if it exists in response
              if (updatedData.image) {
                if (updatedData.image.startsWith('http')) {
                  setUserImage(updatedData.image)
                } else {
                  setUserImage(
                    `https://localhost:8443/storage/${updatedData.image}`
                  )
                }
              }
            }
          } catch (error) {
            // Error eliminado
          }
        }

        fetchUserData()
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el menú está activo y el clic fue fuera del menú, lo cerramos
      if (
        menuActive &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuActive(false)
      }
    }

    // Agregamos el event listener cuando el componente se monta
    document.addEventListener('mousedown', handleClickOutside)

    // Limpiamos el event listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuActive])

  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }

  const handleLogout = () => {
    removeAuthToken()
    setAuthenticated(false)
    navigate('/')
  }

  const handleDashboard = () => {
    const userType = localStorage.getItem('userType')
    if (userType === 'admin') {
      navigate('/admin')
    } else {
      navigate('/user')
    }
  }

  return (
    <header>
      <Link to="/" title={t('actions.goToHomePage')} className="header__logo">
        <img
          className="header__logo__icon"
          src={logo}
          alt={t('alt.logo')}
          title={t('actions.goToHomePage')}
        />
      </Link>
      <nav className="nav__container" ref={menuRef}>
        <ul className={`nav__menu ${menuActive ? 'active' : ''}`}>
          <li>
            <Link
              to="/spaces"
              title={t('actions.goToSpaces')}
              className="nav__link"
            >
              {t('links.spaces')}
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              title={t('actions.goToAbout')}
              className="nav__link"
            >
              {t('links.about')}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              title={t('actions.goToContact')}
              className="nav__link"
            >
              {t('links.contact')}
            </Link>
          </li>
          {authenticated ? (
            <>
              <li>
                <button
                  onClick={handleDashboard}
                  className="nav__button--user"
                  title={t('actions.user')}
                >
                  {t('links.user') + (userName || 'User')}
                  <img
                    src={userImage}
                    className="nav__button--user__img"
                    alt={t('alt.userProfile')}
                    onError={(e) => {
                      // Si hay un error al cargar la imagen, usar la predeterminada
                      e.target.onerror = null
                      e.target.src = leonardo
                    }}
                  />
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="form__submit --noArrow"
                  title={t('actions.logout')}
                >
                  {t('links.logout') || 'Logout'}
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/signin"
                  title={t('actions.register')}
                  className="nav__button--white"
                >
                  {t('links.register')}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  title={t('actions.login')}
                  className="nav__button"
                >
                  {t('links.login')}
                </Link>
              </li>
            </>
          )}
        </ul>
        <button
          className={`nav__menu--button ${menuActive ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={t('actions.menu')}
          title={t('actions.menu')}
        >
          <img
            src={menuHamburger}
            alt={t('alt.menu')}
            title={t('common.menu')}
            className="nav__menu--button__icon"
          />
        </button>
      </nav>
    </header>
  )
}

export default Header
