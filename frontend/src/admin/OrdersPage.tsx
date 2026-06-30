import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { AdminOrder, Campaign } from '../types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pendiente_pago', label: 'Pendiente Pago' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface Filters {
  status: string
  campaign: string
  date_from: string
  date_to: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filters, setFilters] = useState<Filters>({ status: '', campaign: '', date_from: '', date_to: '' })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminOrder | null>(null)
  const [campaignList, setCampaignList] = useState<Campaign[]>([])

  const load = (f: Filters) => {
    setLoading(true)
    api.getAdminOrders({
      status: f.status || undefined,
      campaign: f.campaign || undefined,
      date_from: f.date_from || undefined,
      date_to: f.date_to || undefined,
    }).then(setOrders).finally(() => setLoading(false))
  }

  useEffect(() => { load(filters) }, [filters])

  useEffect(() => {
    api.getAdminCampaigns().then(setCampaignList)
  }, [])

  const handleStatusChange = async (id: number, status: string) => {
    await api.updateOrder(id, { status } as Partial<AdminOrder>)
    load(filters)
    if (selected?.id === id) {
      const updated = await api.getAdminOrder(id)
      setSelected(updated)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Pedidos</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Campaña</label>
          <select value={filters.campaign} onChange={e => setFilters({ ...filters, campaign: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none">
            <option value="">Todas</option>
            {campaignList.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
          <input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
          <input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none" />
        </div>
        <button onClick={() => setFilters({ status: '', campaign: '', date_from: '', date_to: '' })} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          Limpiar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Código</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Alumno</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Sala</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Estado</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-5 py-3 font-mono text-primary font-medium">{o.code}</td>
                    <td className="px-5 py-3">{o.customer_name}</td>
                    <td className="px-5 py-3 text-gray-500">{o.student_name}</td>
                    <td className="px-5 py-3 text-gray-500">{o.classroom}</td>
                    <td className="px-5 py-3 font-medium">${o.total}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{o.status_display}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No hay pedidos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Pedido {selected.code}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{selected.customer_name}</span></div>
                <div><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{selected.phone}</span></div>
                <div><span className="text-gray-500">Alumno:</span> <span className="font-medium">{selected.student_name}</span></div>
                <div><span className="text-gray-500">Sala:</span> <span className="font-medium">{selected.classroom}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-bold text-primary">${selected.total}</span></div>
                <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{new Date(selected.created_at).toLocaleString('es-AR')}</span></div>
              </div>

              {selected.notes && (
                <div className="text-sm"><span className="text-gray-500">Notas:</span> <span>{selected.notes}</span></div>
              )}

              {selected.items.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Items</h3>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    {selected.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product_detail.name} x{item.quantity}</span>
                        <span className="font-medium">${item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cambiar estado</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter(o => o.value).map(o => (
                    <button
                      key={o.value}
                      onClick={() => handleStatusChange(selected.id, o.value)}
                      className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                        selected.status === o.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
