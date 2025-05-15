import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Función para actualizar los metadatos del HTML según el idioma actual
const updateMetadata = () => {
  console.log('Actualizando metadatos para el idioma:', i18n.language);
  
  // Primero asegurarnos que el namespace esté cargado antes de intentar acceder a las traducciones
  if (!i18n.hasLoadedNamespace('translation')) {
    console.log('Namespace "translation" aún no cargado, esperando...');
    // Cargar el namespace y esperar a que esté disponible
    i18n.loadNamespaces('translation').then(() => {
      console.log('Namespace "translation" cargado exitosamente, actualizando metadatos');
      updateMetadataContent();
    }).catch(error => {
      console.error('Error cargando namespace "translation":', error);
    });
  } else {
    // Si el namespace ya está cargado, actualizar directamente
    console.log('Namespace "translation" ya estaba cargado');
    updateMetadataContent();
  }
};

// Función auxiliar para actualizar el contenido de los metadatos
const updateMetadataContent = () => {
  try {
    const metadata = i18n.t('metadata', { returnObjects: true });
    console.log('Metadatos obtenidos:', metadata);
    if (metadata) {
      // Actualizar título
      if (metadata.title) {
        console.log('Actualizando título a:', metadata.title);
        document.title = metadata.title;
      }
      
      // Actualizar descripción
      if (metadata.description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          console.log('Actualizando descripción a:', metadata.description);
          metaDescription.setAttribute('content', metadata.description);
        }
      }
      
      // Actualizar el atributo lang del HTML
      const htmlElement = document.getElementById('htmlRoot');
      if (htmlElement) {
        htmlElement.setAttribute('lang', i18n.language);
        console.log('Idioma del HTML actualizado a:', i18n.language);
      }
    }
  } catch (error) {
    console.error('Error al actualizar metadatos:', error);
  }
};

i18n
  // Carga las traducciones utilizando http (puede también usar archivos estáticos)
  .use(Backend)
  // Detecta el idioma del usuario
  .use(LanguageDetector)
  // Pasa i18n a react-i18next
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // No es necesario para React
    },
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },
  });

// Actualizar metadatos al cambiar el idioma
i18n.on('languageChanged', () => {
  console.log('Idioma cambiado a:', i18n.language);
  setTimeout(updateMetadata, 100); // Pequeño retraso para asegurar que las traducciones estén listas
});

// Manejar la actualización de metadatos después de que i18n se inicialice
i18n.on('initialized', () => {
  console.log('i18n inicializado, actualizando metadatos...');
  // Esperar un momento para dar tiempo a que se carguen las traducciones
  setTimeout(updateMetadata, 200);
});

// Intentar actualizar los metadatos inmediatamente después de cargar i18n
// Si i18n ya está inicializado (cuando se carga desde caché, por ejemplo)
if (i18n.isInitialized) {
  console.log('i18n ya estaba inicializado, actualizando metadatos...');
  // Esperar un momento para dar tiempo a que se carguen las traducciones
  setTimeout(updateMetadata, 100);
} 

// También actualizar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente cargado, verificando si es necesario actualizar metadatos...');
  if (i18n.isInitialized && document.querySelector('meta[name="description"]')) {
    updateMetadata();
  }
});

export default i18n;
