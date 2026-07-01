import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { InstitutionProvider } from './context/InstitutionContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InstitutionProvider><App /></InstitutionProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('No se pudo registrar el service worker:', error)
    })
  })
}
