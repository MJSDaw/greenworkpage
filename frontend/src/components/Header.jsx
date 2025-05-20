import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isAuthenticated, removeAuthToken, getUserType } from '../services/authService'
import { isAuthenticated, removeAuthToken } from '../services/authService'
import logo from '../assets/img/logo.png'
import menuHamburger from '../assets/img/menu_hamburguer.svg'

const Header = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [menuActive, setMenuActive] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
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
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error)
      }
    }
  }, [])

  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }

  const handleLogout = () => {
    removeAuthToken()
    setAuthenticated(false)
    navigate('/')
  }
  const handleDashboard = () => {
    const userType = localStorage.getItem('user_type');
    if (userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/user');
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
      <nav className="nav__container">
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
