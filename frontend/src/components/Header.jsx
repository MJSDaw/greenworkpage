import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/img/logo.png'
import menuHamburger from '../assets/img/menu_hamburguer.svg'

const Header = () => {
  const [menuActive, setMenuActive] = useState(false)

  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }
  
  return (
    <header className='header__container'>
      <Link to="/" title="Go to Home Page" className='header__logo'>
        <img className='header__logo__icon' src={logo} alt='GreenWork Logo' title="GreenWork Logo" />
      </Link>
      <nav className='nav__container'>
        <ul className={`nav__container__menu ${menuActive ? 'active' : ''}`}>
          <li><Link to='/spaces' title="View coworking spaces" className='nav__container__menu__anchor'>Spaces</Link></li>
          <li><Link to='/about' title="Learn more about GreenWork" className='nav__container__menu__anchor'>About</Link></li>
          <li><Link to='/contact' title="Contact GreenWork" className='nav__container__menu__anchor'>Contact</Link></li>
          <li className='nav__container__menu__anchor--button--variant'><Link to='/signin' title="Sign in to your account" className='nav__container__menu__anchor--button--variant__link'>Sign in</Link></li>
          <li className='nav__container__menu__anchor--button'><Link to='/login' title="Login to your account" className='nav__container__menu__anchor--button__link'>Login</Link></li>
        </ul>
        <button className={`nav__container__hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu} aria-label="Open menu" title="Toggle navigation menu">
          <img src={menuHamburger} alt="Hamburger menu icon" title="Toggle menu" className="nav__hamburguer__icon" />
        </button>
      </nav>
    </header>
  )
}

export default Header
