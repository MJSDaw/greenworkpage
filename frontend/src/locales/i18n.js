import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Función para actualizar los metadatos del HTML según el idioma actual
const updateMetadata = () => {
  // Primero asegurarnos que el namespace esté cargado antes de intentar acceder a las traducciones
  if (!i18n.hasLoadedNamespace('translation')) {
    // Cargar el namespace y esperar a que esté disponible
    i18n.loadNamespaces('translation').then(() => {
      updateMetadataContent();
    }).catch(error => {
      // Silenciar el error de carga de namespace
    });
  } else {
    // Si el namespace ya está cargado, actualizar directamente
    updateMetadataContent();
  }
};

// Función auxiliar para actualizar el contenido de los metadatos
const updateMetadataContent = () => {
  try {
    const metadata = i18n.t('metadata', { returnObjects: true });
    if (metadata) {
      // Actualizar título
      if (metadata.title) {
        document.title = metadata.title;
      }
      
      // Actualizar descripción
      if (metadata.description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', metadata.description);
        }
      }
      
      // Actualizar el atributo lang del HTML
      const htmlElement = document.getElementById('htmlRoot');
      if (htmlElement) {
        htmlElement.setAttribute('lang', i18n.language);
      }
    }
  } catch (error) {
    // Silenciar el error de actualización de metadatos
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
    debug: false,
    interpolation: {
      escapeValue: false, // No es necesario para React
    },
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },
    // Deshabilitar todos los logs de i18n
    logger: {
      warn: () => {},
      error: () => {},
      log: () => {}
    }
  });

// Actualizar metadatos al cambiar el idioma
i18n.on('languageChanged', () => {
  setTimeout(updateMetadata, 100); // Pequeño retraso para asegurar que las traducciones estén listas
});

// Manejar la actualización de metadatos después de que i18n se inicialice
i18n.on('initialized', () => {
  // Esperar un momento para dar tiempo a que se carguen las traducciones
  setTimeout(updateMetadata, 200);
});

// Intentar actualizar los metadatos inmediatamente después de cargar i18n
// Si i18n ya está inicializado (cuando se carga desde caché, por ejemplo)
if (i18n.isInitialized) {
  // Esperar un momento para dar tiempo a que se carguen las traducciones
  setTimeout(updateMetadata, 100);
} 

// También actualizar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  if (i18n.isInitialized && document.querySelector('meta[name="description"]')) {
    updateMetadata();
  }
});

export default i18n;
