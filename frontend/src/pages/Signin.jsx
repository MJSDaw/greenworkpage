import React from 'react'
import background from '../assets/img/backgroundLoginRegister.svg'
import { Link } from 'react-router-dom'
import donatello from '../assets/img/donatello.svg';

const Signin = () => {
  return (
    <main className='login__background'>
      
      <section className='login__container'>
        <img className='cheakpeas' src={donatello} alt='Donatello' title="Donatello" />
        <h1>Sign in</h1>
        <form>
          <input placeholder='Name' />
          <input placeholder='Surname' />
          <input placeholder='Birthday' />
          <input placeholder='NIF' />
          <input placeholder='Email' />
          <input placeholder='Password' />
          <input placeholder='Repeat password' />
          <label className='checkbox__label'>
            <input className='checkbox' type='checkbox' />
            I accept the <Link to='/terms' className='form__checkbox'>Terms and Conditions</Link> and the <Link to='/privacy' className='form__checkbox'>Privacy Policy</Link>
          </label>
        </form>
      </section>
    </main>
  )
}

export default Signin
