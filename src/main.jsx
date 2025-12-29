import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { CompareProvider } from './context/CompareContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CompareProvider>
      <App />
    </CompareProvider>
  </StrictMode>,
)
