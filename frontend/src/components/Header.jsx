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
      <Link to="/">
        <img src={logo} alt='GreenWork Logo' />
      </Link>
      <nav className='nav__container'>
        <ul className={`nav__menu ${menuActive ? 'active' : ''}`}>
          <li><Link to='/spaces'>Spaces</Link></li>
          <li><Link to='/about'>About</Link></li>
          <li><Link to='/contact'>Contact</Link></li>
          <li><Link to='/signin'>Sign in</Link></li>
          <li><Link to='/login'>Login</Link></li>
        </ul>
        <button className={`nav__hamburger button--icon ${menuActive ? 'active' : ''}`} onClick={toggleMenu} aria-label="Open menu">
          <img src={menuHamburger} alt="Hamburguer svg" className="nav__hamburguer__icon" />
        </button>
      </nav>
    </header>
  )
}

export default Header
