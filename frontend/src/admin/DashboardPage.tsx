import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { DashboardData } from '../types'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>
  if (!data) return null

  const stats = [
    { label: 'Total Pedidos', value: data.total_orders, color: 'bg-blue-500' },
    { label: 'Ventas', value: `$${data.total_sales}`, color: 'bg-primary' },
    { label: 'Cobros', value: `$${data.total_collected}`, color: 'bg-emerald-500' },
    { label: 'Pendiente Cobrar', value: `$${data.pending_amount}`, color: 'bg-amber-500' },
    { label: 'Entregas Pendientes', value: data.pending_deliveries, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-md p-5">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
              <span className="text-white text-sm font-bold">
                {s.label.charAt(0)}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {data.latest_orders && data.latest_orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-heading font-bold text-gray-900">Últimos Pedidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Código</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Estado</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.latest_orders.map((order: { id: number; code: string; customer_name: string; total: string; status_display: string; created_at: string }) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-primary font-medium">{order.code}</td>
                    <td className="px-5 py-3">{order.customer_name}</td>
                    <td className="px-5 py-3 font-medium">${order.total}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {order.status_display}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
