import React from 'react'
import logo from '../assets/img/logo.png'

const Header = () => {
  return (
    <header className='header__container'>
      <img src={logo} alt='GreenWork Logo'/>
      <nav>
        <a href="#">Menú</a>
        <a href="#">Registrarme</a>
        <a href="#">Iniciar sesión</a>
      </nav>
    </header>
  )
}

export default Header
