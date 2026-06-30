import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🏫</span>
          <span className="font-heading font-bold text-lg text-gray-900">
            Cooperadora
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
        </div>
      </div>
    </nav>
  )
}
