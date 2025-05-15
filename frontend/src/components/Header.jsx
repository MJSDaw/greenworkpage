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
      <Link to="/" title="Go to Home Page">
        <img src={logo} alt='GreenWork Logo' title="GreenWork Logo" />
      </Link>
      <nav className='nav__container'>
        <ul className={`nav__menu ${menuActive ? 'active' : ''}`}>
          <li className='link'><Link to='/spaces' title="View coworking spaces" className='link__anchor'>Spaces</Link></li>
          <li className='link'><Link to='/about' title="Learn more about GreenWork" className='link__anchor'>About</Link></li>
          <li className='link'><Link to='/contact' title="Contact GreenWork" className='link__anchor'>Contact</Link></li>
          <li className='link__button--variant1'><Link to='/signin' title="Sign in to your account" className='link__anchor--variant2'>Sign in</Link></li>
          <li className='link__button'><Link to='/login' title="Login to your account" className='link__anchor--variant1'>Login</Link></li>
        </ul>
        <button className={`nav__hamburger button--icon ${menuActive ? 'active' : ''}`} onClick={toggleMenu} aria-label="Open menu" title="Toggle navigation menu">
          <img src={menuHamburger} alt="Hamburger menu icon" title="Toggle menu" className="nav__hamburguer__icon" />
        </button>
      </nav>
    </header>
  )
}

export default Header
