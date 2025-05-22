const ServiceCard = ({ src, title }) => {
  return (
    <div className="service__card">
      <img src={`https://localhost:8443/storage/${src}`} alt={title} />
      <span>{title}</span>
    </div>
  )
}

export default ServiceCard
