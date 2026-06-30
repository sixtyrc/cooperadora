import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const links = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/campanas', label: 'Campañas', icon: '🎯' },
  { to: '/admin/productos', label: 'Productos', icon: '📦' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '🛒' },
  { to: '/admin/pagos', label: 'Pagos', icon: '💰' },
  { to: '/admin/entregas', label: 'Entregas', icon: '🚚' },
  { to: '/admin/reportes', label: 'Reportes', icon: '📈' },
  { to: '/admin/configuracion', label: 'Configuración', icon: '⚙️' },
  { to: '/admin/usuarios', label: 'Usuarios', icon: '👥', adminOnly: true },
  { to: '/admin/auditoria', label: 'Auditoría', icon: '📋', adminOnly: true },
  { to: '/admin/ayuda', label: 'Manual', icon: '❓' },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ username: string; role: string; is_admin: boolean } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.getMe().then(setUser).catch(() => navigate('/admin/login'))
  }, [navigate])

  const handleLogout = async () => {
    try {
      await api.logout()
    } finally {
      navigate('/admin/login')
    }
  }

  const filteredLinks = links.filter(l => !l.adminOnly || user?.is_admin)

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div>
              <h2 className="font-heading font-bold text-gray-900">Cooperadora</h2>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {filteredLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.username}
                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {user.role}
                </span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Salir
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
