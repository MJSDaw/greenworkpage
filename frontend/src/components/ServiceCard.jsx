import { API_BASE_URL } from "../services/apiService"

const ServiceCard = ({ src, title }) => {
  return (
    <div className="service__card">
      <img src={`${API_BASE_URL}/storage/${src}`} alt={title} style={{width: '50px'}} />
      <span>{title}</span>
    </div>
  )
}

export default ServiceCard
