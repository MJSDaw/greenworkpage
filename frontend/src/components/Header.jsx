import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/img/logo.png'
import menuHamburger from '../assets/img/menu_hamburguer.svg'
import { isAuthenticated, removeAuthToken, AUTH_STATE_CHANGED_EVENT } from '../services/authService'

const Header = () => {
  const { t } = useTranslation()
  const [menuActive, setMenuActive] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  // Verificar el estado de autenticación cuando el componente se monta
  // y cada vez que cambie el estado de autenticación
  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
    };

    // Verificar al montar el componente
    checkAuth();

    // Escuchar cambios en localStorage (desde otras pestañas)
    window.addEventListener('storage', checkAuth);
    
    // Escuchar el evento personalizado de cambio de estado de autenticación
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, checkAuth);
    };
  }, []);

  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }
  
  const handleLogout = () => {
    removeAuthToken()
    window.location.href = '/'
  }

  return (
    <header className="header__container">
      <Link to="/" title={t('actions.goToHomePage')} className="header__logo">
        <img
          className="header__logo__icon"
          src={logo}
          alt={t('alt.logo')}
          title={t('actions.goToHomePage')}
        />
      </Link>
      <nav className="nav__container">
        <ul className={`nav__container__menu ${menuActive ? 'active' : ''}`}>
          <li>
            <Link
              to="/spaces"
              title={t('actions.goToSpaces')}
              className="nav__container__menu__anchor"
            >
              {t('links.spaces')}
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              title={t('actions.goToAbout')}
              className="nav__container__menu__anchor"
            >
              {t('links.about')}
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              title={t('actions.goToContact')}
              className="nav__container__menu__anchor"
            >
              {t('links.contact')}
            </Link>
          </li>
          {!authenticated && (
            <>
              <li className="nav__container__menu__anchor--button--variant">
                <Link
                  to="/signin"
                  title={t('actions.register')}
                  className="nav__container__menu__anchor--button--variant__link"
                >
                  {t('actions.register')}
                </Link>
              </li>
              <li className="nav__container__menu__anchor--button">
                <Link
                  to="/login"
                  title={t('actions.login')}
                  className="nav__container__menu__anchor--button__link"
                >
                  {t('actions.login')}
                </Link>
              </li>
            </>
          )}
        </ul>
        <button
          className={`nav__container__hamburger ${menuActive ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={t('actions.menu')}
          title={t('actions.menu')}
        >
          <img
            src={menuHamburger}
            alt={t('alt.menu')}
            title={t('common.menu')}
            className="nav__hamburguer__icon"
          />
        </button>
      </nav>
    </header>
  )
}

export default Header
