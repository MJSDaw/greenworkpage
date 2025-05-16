import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/img/logoVariant1.png'
import github from '../assets/img/githubLogo.svg'
import instagram from '../assets/img/instagramLogo.svg'
import facebook from '../assets/img/facebookLogo.svg'
import twitter from '../assets/img/twitterLogo.svg'
import linkedin from '../assets/img/linkedinLogo.svg'

const Footer = () => {
  const { t } = useTranslation()
  return (
    <footer>
      <section className="footer__content">
        <Link to="/" title={t('actions.goToHomePage')} className="header__logo">
          <img
            className="header__logo__icon"
            src={logo}
            alt={t('alt.logoVariant1')}
            title={t('actions.goToHomePage')}
          />
        </Link>
        <article className="footer__icons">
          <Link
            to="https://github.com/MJSDaw/greenworkpage"
            title={t('actions.goToGithub')}
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={github}
              alt={t('common.goToGithub')}
              title={t('actions.goToGithub')}
            />
          </Link>
          <Link
            to="https://www.instagram.com/"
            title={t('actions.goToInstagram')}
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={instagram}
              alt={t('common.instagram')}
              title={t('actions.goToInstagram')}
            />
          </Link>
          <Link
            to="https://www.facebook.com/"
            title={t('actions.goToFacebook')}
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={facebook}
              alt={t('common.facebook')}
              title={t('actions.goToFacebook')}
            />
          </Link>
          <Link
            to="https://x.com/"
            title={t('actions.goToTwitter')}
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={twitter}
              alt={t('common.twitter')}
              title={t('actions.goToTwitter')}
            />
          </Link>
          <Link
            to="https://www.linkedin.com/"
            title={t('actions.goToLinkedIn')}
            className="icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="icon__svg"
              src={linkedin}
              alt={t('common.linkedIn')}
              title={t('actions.goToLinkedIn')}
            />
          </Link>
        </article>
      </section>
      <section className="footer__content--links">
        <Link
          to="/spaces"
          title={t('actions.goToSpaces')}
          className="footer__anchor"
        >
          {t('links.spaces')}
        </Link>

        <Link
          to="/about"
          title={t('actions.goToAbout')}
          className="footer__anchor"
        >
          {t('links.about')}
        </Link>
        <Link
          to="/contact"
          title={t('actions.goToContact')}
          className="footer__anchor"
        >
          {t('links.contact')}
        </Link>
      </section>
      <section className="footer__content">
        <Link
          to="https://github.com/MJSDaw/greenworkpage"
          title={t('actions.goToGithub')}
          className="footer__anchor"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('links.problemSolvers')}
        </Link>
        <article className="footer__content--links">
          <Link
            to="/terms"
            title={t('actions.goToTerms')}
            className="footer__anchor"
          >
            {t('links.terms')}
          </Link>
          <div className="footer__decorator"></div>
          <Link
            to="/privacy"
            title={t('actions.goToPrivacy')}
            className="footer__anchor"
          >
            {t('links.privacy')}
          </Link>
        </article>
      </section>
    </footer>
  )
}

export default Footer
