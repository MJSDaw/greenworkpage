const ServiceCard = ({ src, title }) => {
  return (
    <div className="service__card">
      <img src={`https://localhost:8443/storage/${src}`} alt={title} style={{width: '50px'}} />
      <span>{title}</span>
    </div>
  )
}

export default ServiceCard
