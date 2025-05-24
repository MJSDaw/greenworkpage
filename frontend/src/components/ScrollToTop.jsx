import { useState, useEffect } from 'react';
import '../assets/ScrollToTop.css'; 
import arrowTopito from '../assets/img/arrowTopito.svg'; 

/**
 * Componente que muestra un botón para volver al inicio de la página
 * El botón aparece después de desplazarse una cierta distancia
 */
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Controla la visibilidad del botón basado en el scroll
  useEffect(() => {
    const toggleVisibility = () => {
      // Muestra el botón cuando el usuario baja más de 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Agrega el event listener
    window.addEventListener('scroll', toggleVisibility);

    // Limpia el event listener cuando el componente se desmonta
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Función para desplazarse al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button 
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Volver al inicio de la página"
        >
          <img src={ arrowTopito } alt="arrowTopito" />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
