import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Function to update HTML metadata according to the current language
const updateMetadata = () => {
  // First make sure the namespace is loaded before trying to access translations
  if (!i18n.hasLoadedNamespace('translation')) {
    // Load the namespace and wait for it to be available
    i18n.loadNamespaces('translation').then(() => {
      updateMetadataContent();    }).catch(error => {
      // Silence namespace loading error
    });} else {
    // If the namespace is already loaded, update directly
    updateMetadataContent();
  }
};

// Helper function to update metadata content
const updateMetadataContent = () => {
  try {
    const metadata = i18n.t('metadata', { returnObjects: true });    if (metadata) {
      // Update title
      if (metadata.title) {
        document.title = metadata.title;
      }
      
      // Update description
      if (metadata.description) {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', metadata.description);
        }
      }      
      // Update the lang attribute of HTML
      const htmlElement = document.getElementById('htmlRoot');
      if (htmlElement) {
        htmlElement.setAttribute('lang', i18n.language);
      }
    }  } catch (error) {
    // Silence metadata update error
  }
};

i18n
  // Load translations using http (can also use static files)
  .use(Backend)  // Detect user language
  .use(LanguageDetector)
  // Pass i18n to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: false,    interpolation: {
      escapeValue: false, // Not needed for React
    },
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },    // Disable all i18n logs
    logger: {
      warn: () => {},
      error: () => {},
      log: () => {}
    }
  });

// Update metadata when language changes
i18n.on('languageChanged', () => {
  setTimeout(updateMetadata, 100); // Small delay to ensure translations are ready
});

// Handle metadata updates after i18n initialization
i18n.on('initialized', () => {
  // Wait a moment to give time for translations to load
  setTimeout(updateMetadata, 200);
});

// Try to update metadata immediately after loading i18n
// If i18n is already initialized (when loaded from cache, for example)
if (i18n.isInitialized) {
  // Wait a moment to give time for translations to load
  setTimeout(updateMetadata, 100);
} 

// Also update when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  if (i18n.isInitialized && document.querySelector('meta[name="description"]')) {
    updateMetadata();
  }
});

export default i18n;
