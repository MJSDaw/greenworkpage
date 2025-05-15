# Internacionalización (i18n) en la Aplicación Frontend

Este documento explica cómo implementar y utilizar múltiples idiomas en la aplicación frontend utilizando la biblioteca react-i18next.

## Estructura de archivos

La aplicación ya cuenta con una estructura base para la internacionalización:

```
src/
  locales/
    en/   # Archivos de traducción en inglés
    es/   # Archivos de traducción en español
```

## Configuración básica

### 1. Crear archivos de traducción

Para cada idioma, crea un archivo de traducción JSON en la carpeta correspondiente:

**src/locales/en/translation.json**:
```json
{
  "common": {
    "home": "Home",
    "spaces": "Spaces",
    "about": "About Us",
    "contact": "Contact",
    "signin": "Sign In",
    "login": "Log In"
  }
}
```

**src/locales/es/translation.json**:
```json
{
  "common": {
    "home": "Inicio",
    "spaces": "Espacios",
    "about": "Nosotros",
    "contact": "Contacto",
    "signin": "Registrarse",
    "login": "Iniciar Sesión"
  }
}
```

### 2. Configurar i18next

Crea un archivo de configuración para i18next:

**src/i18n.js**:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

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
      escapeValue: false, 
    },
    backend: {
      loadPath: '/src/locales/{{lng}}/{{ns}}.json',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
```

### 3. Integrar i18n en la aplicación

Modifica tu archivo principal (main.jsx) para incluir la configuración i18n:

**src/main.jsx**:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; // Importar la configuración de i18n

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Uso

### Uso básico en componentes

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('content.welcome')}</p>
    </div>
  );
}
```

### Cambiar el idioma

```jsx
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
}
```

## Ejemplo práctico: Header con soporte multilenguaje

En tu componente Header, puedes implementar el cambio de idioma de la siguiente manera:

```jsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Header() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <header>
      <nav>
        <ul>
          <li><Link to="/">{t('common.home')}</Link></li>
          <li><Link to="/spaces">{t('common.spaces')}</Link></li>
          <li><Link to="/about">{t('common.about')}</Link></li>
          <li><Link to="/contact">{t('common.contact')}</Link></li>
        </ul>
      </nav>
      <div className="language-switcher">
        <button onClick={() => changeLanguage('en')}>EN</button>
        <button onClick={() => changeLanguage('es')}>ES</button>
      </div>
    </header>
  );
}
```

## Características avanzadas

### Pluralización

```json
{
  "item": "{{count}} item",
  "item_plural": "{{count}} items"
}
```

```jsx
t('item', { count: 1 }); // "1 item"
t('item', { count: 2 }); // "2 items"
```

### Interpolación

```json
{
  "welcome": "Bienvenido, {{name}}!"
}
```

```jsx
t('welcome', { name: 'Juan' }); // "Bienvenido, Juan!"
```

### Formatos de fecha y números

Para formatear fechas y números según el idioma, puedes utilizar Intl.DateTimeFormat y Intl.NumberFormat:

```jsx
const formatDate = (date) => {
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
```

## Buenas prácticas

1. Organiza tus traducciones en categorías lógicas (common, form, errors, etc.)
2. Utiliza claves de traducción descriptivas
3. Mantén las traducciones actualizadas cuando agregues nuevas características
4. Guarda el idioma seleccionado en localStorage para recordar la preferencia del usuario

## Recursos Adicionales

- [Documentación oficial de react-i18next](https://react.i18next.com/)
- [i18next documentation](https://www.i18next.com/)
