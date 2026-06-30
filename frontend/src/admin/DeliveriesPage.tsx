import { useEffect, useState, useMemo } from 'react'
import { api } from '../api/client'
import type { DeliveryCheck, Campaign } from '../types'

export default function DeliveriesPage() {
  const [orders, setOrders] = useState<DeliveryCheck[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [campaign, setCampaign] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    const camps = await api.getAdminCampaigns()
    setCampaigns(camps)
    // Si no hay campaña seleccionada, buscar la activa
    if (!campaign) {
      const active = camps.find(c => c.status === 'active')
      if (active) setCampaign(active.slug)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (!campaign) return
    setLoading(true)
    api.getDeliveryCheck(campaign).then(setOrders).finally(() => setLoading(false))
  }, [campaign])

  const filtered = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter(o =>
      o.customer_name.toLowerCase().includes(q) ||
      o.student_name.toLowerCase().includes(q) ||
      o.code.toLowerCase().includes(q)
    )
  }, [orders, search])

  const deliveredCount = filtered.filter(o => o.is_delivered).length

  const handleToggle = async (orderId: number) => {
    setToggling(orderId)
    try {
      const res = await api.toggleDelivery(orderId)
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, is_delivered: res.delivered } : o
      ))
    } catch {
      // silently fail
    } finally {
      setToggling(null)
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">Entregas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Campaña</label>
          <select value={campaign} onChange={e => setCampaign(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none">
            <option value="">Seleccionar campaña</option>
            {campaigns.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-[2] min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nombre del cliente, alumno o código..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Resumen */}
      {campaign && (
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <span>{filtered.length} pedidos</span>
          <span className="text-green-600 font-medium">{deliveredCount} entregados</span>
          <span className="text-orange-500 font-medium">{filtered.length - deliveredCount} pendientes</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500 w-12">✓</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Código</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Alumno/a</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Sala</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${o.is_delivered ? 'bg-green-50/50' : ''}`}>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggle(o.id)}
                        disabled={toggling === o.id}
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          o.is_delivered
                            ? 'bg-primary border-primary text-white'
                            : 'border-gray-300 hover:border-primary'
                        } disabled:opacity-50`}
                      >
                        {toggling === o.id ? (
                          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : o.is_delivered ? (
                          <span className="text-sm font-bold">✓</span>
                        ) : null}
                      </button>
                    </td>
                    <td className="px-5 py-3 font-mono text-primary font-medium">{o.code}</td>
                    <td className="px-5 py-3 font-medium">{o.customer_name}</td>
                    <td className="px-5 py-3 text-gray-600">{o.student_name}</td>
                    <td className="px-5 py-3 text-gray-600">{o.classroom}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        o.is_delivered ? 'bg-green-100 text-green-700' :
                        o.status === 'pagado' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {o.is_delivered ? 'Entregado' : o.status_display}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    {orders.length === 0 ? 'No hay pedidos para esta campaña' : 'No se encontraron resultados'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
