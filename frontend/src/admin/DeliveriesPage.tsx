import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Delivery, AdminOrder } from '../types'

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Delivery | null>(null)
  const [pendingOrders, setPendingOrders] = useState<AdminOrder[]>([])
  const [form, setForm] = useState({ order: 0, notes: '' })

  const load = () => {
    setLoading(true)
    api.getAdminDeliveries().then(setDeliveries).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = async () => {
    const orders = await api.getAdminOrders('pagado')
    setPendingOrders(orders)
    setForm({ order: orders[0]?.id || 0, notes: '' })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.createDelivery(form)
    setShowModal(false)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Entregas</h1>
        <button onClick={openNew} className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm">
          Nueva Entrega
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
                  <th className="text-left px-5 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Pedido</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Entregado por</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Notas</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs">#{d.id}</td>
                    <td className="px-5 py-3 font-mono text-primary">{d.order_code}</td>
                    <td className="px-5 py-3">{d.user_name}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(d.delivered_at).toLocaleString('es-AR')}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{d.notes || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setSelected(d)} className="text-primary hover:text-primary-dark text-sm">Ver</button>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay entregas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg">Nueva Entrega</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pedido (pagado)</label>
                <select value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" required>
                  {pendingOrders.length === 0 && <option value={0}>No hay pedidos pagados</option>}
                  {pendingOrders.map(o => <option key={o.id} value={o.id}>{o.code} - {o.customer_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Entrega #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div><span className="text-gray-500">Pedido:</span> <span className="font-mono font-medium text-primary">{selected.order_code}</span></div>
              <div><span className="text-gray-500">Entregado por:</span> <span className="font-medium">{selected.user_name}</span></div>
              <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{new Date(selected.delivered_at).toLocaleString('es-AR')}</span></div>
              {selected.notes && <div><span className="text-gray-500">Notas:</span> <span>{selected.notes}</span></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
