# Internationalization (i18n) in the Frontend Application

This document explains how to implement and use multiple languages in the frontend application using the react-i18next library.

## File Structure

The application already has a basic structure for internationalization:

```
src/
  locales/
    en/   # English translation files
    es/   # Spanish translation files
```

## Basic Configuration

### 1. Create Translation Files

For each language, create a JSON translation file in the corresponding folder:

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

### 2. Configure i18next

Create a configuration file for i18next:

**src/i18n.js**:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Load translations using http (can also use static files)
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n to react-i18next
  .use(initReactI18next)
  // Initialize i18next
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

### 3. Integrate i18n into the Application

Modify your main file (main.jsx) to include the i18n configuration:

**src/main.jsx**:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; // Import i18n configuration

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## Usage

### Basic Usage in Components

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

### Changing the Language

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

## Practical Example: Header with Multilanguage Support

In your Header component, you can implement language switching as follows:

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

## Advanced Features

### Pluralization

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

### Interpolation

```json
{
  "welcome": "Welcome, {{name}}!"
}
```

```jsx
t('welcome', { name: 'John' }); // "Welcome, John!"
```

### Date and Number Formats

To format dates and numbers according to the language, you can use Intl.DateTimeFormat and Intl.NumberFormat:

```jsx
const formatDate = (date) => {
  return new Intl.DateTimeFormat(i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
```

## Best Practices

1. Organize your translations in logical categories (common, form, errors, etc.)
2. Use descriptive translation keys
3. Keep translations updated when adding new features
4. Store the selected language in localStorage to remember user preferences

## Additional Resources

- [Official react-i18next documentation](https://react.i18next.com/)
- [i18next documentation](https://www.i18next.com/)
