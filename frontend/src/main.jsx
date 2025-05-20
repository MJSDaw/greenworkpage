import 'normalize.css'
import './index.css'
import './locales/i18n';
import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setupFetchInterceptor } from './services/fetchInterceptor'

import App from './App.jsx'

// Setup fetch interceptor to handle 401 responses globally
setupFetchInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
