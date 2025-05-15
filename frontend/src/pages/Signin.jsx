import React from 'react'
import { Link } from 'react-router-dom'
import donatello from '../assets/img/donatello.svg'

const Signin = () => {
  return (
    <main className="login__background">
      <section className="login__container">
        <img
          className="cheakpeas"
          src={donatello}
          alt="Donatello"
          title="Donatello Cheakpeas"
        />
        <h1>Sign in</h1>
        <form>
          <>
            <label htmlFor="name">Name:</label>
            <input id="name" name="name" placeholder="Name" />
          </>
          <>
            <label htmlFor="surname">Surname:</label>
            <input id="surname" name="surname" placeholder="Surname" />
          </>
          <>
            <label htmlFor="birthday">Birthday:</label>
            <input id="birthday" name="birthday" placeholder="Birthday" />
          </>
          <>
            <label htmlFor="nif">NIF:</label>
            <input id="nif" name="nif" placeholder="NIF" />
          </>
          <>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" placeholder="Email" />
          </>
          <>
            <label htmlFor="password">Password:</label>
            <input id="password" name="password" placeholder="Password" />
          </>
          <>
            <label htmlFor="confirmPassword">Repeat password:</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Repeat password"
            />
          </>
          <label className="checkbox__label">
            <input className="checkbox" type="checkbox" />
            <span className="checkbox__text">
              I accept the{' '}
              <Link to="/terms" className="form__checkbox">
                Terms and Conditions
              </Link>{' '}
              and the{' '}
              <Link to="/privacy" className="form__checkbox">
                Privacy Policy
              </Link>
            </span>
          </label>
          <span className="link__text">
            Already have an account? {' '}
            <Link to="/login" className="form__link">
              Log in
            </Link>
          </span>
          <input
            type="submit"
            value="Sign in"
            className="form__submit"
          />
        </form>
      </section>
    </main>
  )
}

export default Signin
