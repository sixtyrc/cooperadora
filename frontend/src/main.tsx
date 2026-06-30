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
