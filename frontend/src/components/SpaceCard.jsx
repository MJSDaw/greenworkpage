import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const SpaceCard = ({ src, subtitle, amount, maps, seats, link }) => {
  const { t } = useTranslation()
  return (
    <div className="space-card">
      <div className="space-card__image-container">
        <img src={src} alt={subtitle} className="space-card__image" />
      </div>
      <div className="space-card__content">
        <div className='space-card__content__text'>
          <span>{subtitle}</span>
          <span>{amount}€</span>
        </div>
        <div className='space-card__content__text'>
          <p>{maps}</p>
          <p>{seats} {t('form.seats.label')}</p>
        </div>
      </div>
      <Link to={link} className='form__submit --noArrow' style={{ textDecoration: 'none', display: 'inline-block' }} onClick={() => window.scrollTo(0, 0)}>
        {t('actions.checkSpace')}
      </Link>
    </div>
  )
}

SpaceCard.propTypes = {
  src: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  maps: PropTypes.string.isRequired,
  seats: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  link: PropTypes.string.isRequired,
}

export default SpaceCard