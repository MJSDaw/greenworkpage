import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Guardar preferencia en localStorage para persistencia
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <div className="language-selector">
      <button 
        className={`language-btn ${i18n.language === 'es' ? 'active' : ''}`} 
        onClick={() => changeLanguage('es')}
        title={t('language.spanish')}
      >
        ES
      </button>
      <div className="language-divider"></div>
      <button 
        className={`language-btn ${i18n.language === 'en' ? 'active' : ''}`} 
        onClick={() => changeLanguage('en')}
        title={t('language.english')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector;
