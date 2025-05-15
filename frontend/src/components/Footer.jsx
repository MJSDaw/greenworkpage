import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/img/logoVariant1.png'
import github from '../assets/img/githubLogo.svg'
import instagram from '../assets/img/instagramLogo.svg'
import facebook from '../assets/img/facebookLogo.svg'
import twitter from '../assets/img/twitterLogo.svg'
import linkedin from '../assets/img/linkedinLogo.svg'

const Footer = () => {
  return (
    <footer className="footer__container">
      <section className="footer__container__content">
        <Link to="/" title="Go to Home Page" className="header__logo">
          <img
            className="header__logo__icon"
            src={logo}
            alt="GreenWork Logo Variant 1"
            title="GreenWork Logo"
          />
        </Link>
        <article className="icons__container">
          <Link
            to="https://github.com/MJSDaw/greenworkpage"
            title="Go to Github"
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={github}
              alt="Github"
              title="Github Logo"
            />
          </Link>
          <Link
            to="https://www.instagram.com/"
            title="Go to Instagram"
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={instagram}
              alt="Instagram"
              title="Instagram Logo"
            />
          </Link>
          <Link
            to="https://www.facebook.com/"
            title="Go to Facebook"
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={facebook}
              alt="Facebook"
              title="Facebook Logo"
            />
          </Link>
          <Link
            to="https://x.com/"
            title="Go to Twitter"
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={twitter}
              alt="Twitter"
              title="Twitter Logo"
            />
          </Link>
          <Link
            to="https://www.linkedin.com/"
            title="Go to LinkedIn"
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={linkedin}
              alt="LinkedIn"
              title="LinkedIn Logo"
            />
          </Link>
        </article>
      </section>
      <section className="footer__container__content--variant1">
        <Link
          to="/spaces"
          title="View coworking spaces"
          className="footer__anchor"
        >
          Spaces
        </Link>

        <Link
          to="/about"
          title="Learn more about GreenWork"
          className="footer__anchor"
        >
          About
        </Link>
        <Link
          to="/contact"
          title="Contact GreenWork"
          className="footer__anchor"
        >
          Contact
        </Link>
      </section>
      <section className="footer__container__content">
        <Link
          to="https://github.com/MJSDaw/greenworkpage"
          title="ProblemSolvers"
          className="footer__anchor"
          target="_blank"
          rel="noopener noreferrer"
        >
          Creado por ProblemSolvers con amor 💚
        </Link>
        <article className='links_container'>
          <Link
            to="/terms"
            title="Terms and Conditions"
            className="footer__anchor"
          >
            Terms and conditions
          </Link>
          <div className='decorator'></div>
          <Link
            to="/privacy"
            title="Privacy Policy"
            className="footer__anchor"
          >
            Privacy policy
          </Link>
        </article>
      </section>
    </footer>
  )
}

export default Footer
