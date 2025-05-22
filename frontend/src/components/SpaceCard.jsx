import { useTranslation } from 'react-i18next'

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
      <button className='form__submit --noArrow'>{t('actions.checkSpace')}</button>
    </div>
  )
}

export default SpaceCard