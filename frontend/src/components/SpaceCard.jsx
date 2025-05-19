import React from 'react'

const SpaceCard = ({ src }) => {
  return (
    <section className="space-card">
      <img src={src} alt="space" />
      <article className="space-card__content">
        <h2 className="space-card__title">Title</h2>
        <p className="space-card__description">Description</p>
        <button className="space-card__button">Button</button>
      </article>
    </section>
  )
}

export default SpaceCard
