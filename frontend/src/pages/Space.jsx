import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ContactUs from '../components/ContactUs'
import { getSpaceById } from '../services/apiService'

const Space = () => {
  const { id } = useParams()
  const [space, setSpace] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true)
        const response = await getSpaceById(id)
        if (response && response.data) {
          const spacesData = {
            src: `https://localhost:8443/storage/${response.data.images.split('|')[0]}`,
            subtitle: response.data.subtitle,
            amount: response.data.price,
            maps: response.data.address || '',
            seats: response.data.places,
          }
          setSpace(spacesData)
        }
      } catch (error) {
        console.error('Error al cargar espacios:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSpace()
  }, [])

  return (
    <div>
      <h1>SPACE {id}</h1>
      <img src={space.src} alt="" />
      <ContactUs />
    </div>
  )
}

export default Space
