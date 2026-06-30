import { Link, useLocation } from 'react-router-dom'
import { useInstitution } from '../context/useInstitution'
import { mediaUrl } from '../api/media'

export default function Navbar() {
  const { pathname } = useLocation()
  const { institution } = useInstitution()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          {institution?.logo
            ? <img src={mediaUrl(institution.logo)} alt="" className="w-9 h-9 rounded-lg object-contain" />
            : <span className="text-2xl">🏫</span>}
          <span className="font-heading font-bold text-lg text-gray-900">
            {institution?.name || 'Cooperadora'}
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className={`no-underline font-medium transition-colors ${
              pathname === '/' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Inicio
          </Link>
          <Link
            to="/campanas"
            className={`no-underline font-medium transition-colors ${
              pathname.startsWith('/campanas') ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Campañas
          </Link>
          <Link
            to="/consultar"
            className={`no-underline font-medium transition-colors ${
              pathname === '/consultar' ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Consultar pedido
          </Link>
          <Link
            to="/admin"
            className="w-9 h-9 bg-gray-100 hover:bg-primary hover:text-white rounded-xl flex items-center justify-center text-gray-400 transition-all"
            title="Panel admin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  )
}
