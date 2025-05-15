import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import donatello from '../assets/img/donatello.svg'

const Signin = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthdate: '',
    dni: '',
    email: '',
    password: '',
    password_confirm: '',
    termsAndConditions: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
  const handleTermsChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      termsAndConditions: e.target.checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('https://localhost:8443/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log('Registration response:', data)
    } catch (error) {
      console.error('Registration error:', error)
    }
  }

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
        <form onSubmit={handleSubmit}>
          <>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
          </>
          <>
            <label htmlFor="surname">Surname:</label>
            <input
              id="surname"
              name="surname"
              placeholder="Surname"
              value={formData.surname}
              onChange={handleChange}
            />
          </>
          <>
            <label htmlFor="birthday">Birthday:</label>
            <input
              id="birthday"
              name="birthdate"
              placeholder="Birthday"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </>
          <>
            <label htmlFor="nif">NIF:</label>
            <input
              id="nif"
              name="dni"
              placeholder="NIF"
              value={formData.dni}
              onChange={handleChange}
            />
          </>
          <>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </>
          <>
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </>{' '}
          <>
            <label htmlFor="confirmPassword">Repeat password:</label>
            <input
              id="confirmPassword"
              name="password_confirm"
              type="password"
              placeholder="Repeat password"
              value={formData.password_confirm}
              onChange={handleChange}
            />
          </>
            <label className="checkbox__label">
            <input
              className="checkbox"
              type="checkbox"
              name="termsAndConditions"
              checked={formData.termsAndConditions}
              onChange={handleTermsChange}
            />
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
            Already have an account?{' '}
            <Link to="/login" className="form__link">
              Log in
            </Link>
          </span>
          <input type="submit" value="Sign in" className="form__submit" />
        </form>
      </section>
    </main>
  )
}

export default Signin
