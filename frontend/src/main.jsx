import 'normalize.css'
import './index.css'
import './locales/i18n';
import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
