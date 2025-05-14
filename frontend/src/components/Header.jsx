import React, { useState } from 'react'
import logo from '../assets/img/logo.png'
import menuHamburger from '../assets/img/menu_hamburguer.svg'


const Header = () => {
  const [menuActive, setMenuActive] = useState(false)

  const toggleMenu = () => {
    setMenuActive(!menuActive)
  }
  
  return (
    <header className='header__container'>
      <img src={logo} alt='GreenWork Logo' />
      <nav className='nav__container'>
        <div className={`nav__menu ${menuActive ? 'active' : ''}`}>
          <a href="#">Spaces</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a className='link__button--variant1' href="#">Sign in</a>
          <a className='link__button' href="#">Login</a>
        </div>
        <button className={`nav__hamburger button--icon ${menuActive ? 'active' : ''}`} onClick={toggleMenu} aria-label="Open menu">
          <img src={menuHamburger} alt="Hamburguer svg" className="nav__hamburguer__icon" />
        </button>
      </nav>
    </header>
  )
}

export default Header
