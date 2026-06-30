import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Payment } from '../types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'verificado', label: 'Verificado' },
  { value: 'rechazado', label: 'Rechazado' },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Payment | null>(null)

  const load = () => {
    setLoading(true)
    api.getAdminPayments(filter || undefined).then(setPayments).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const handleVerify = async (id: number, status: string) => {
    await api.updatePayment(id, { status } as Partial<Payment>)
    load()
    setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Pagos</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
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
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Método</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Estado</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(p)}>
                    <td className="px-5 py-3 font-mono text-xs">#{p.id}</td>
                    <td className="px-5 py-3 font-mono text-primary">#{p.order}</td>
                    <td className="px-5 py-3">{p.method}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        p.status === 'verificado' ? 'bg-green-100 text-green-700' :
                        p.status === 'rechazado' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status_display}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('es-AR')}</td>
                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {p.status === 'pendiente' && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleVerify(p.id, 'verificado')} className="text-green-600 hover:text-green-800 text-sm">Verificar</button>
                          <button onClick={() => handleVerify(p.id, 'rechazado')} className="text-red-500 hover:text-red-700 text-sm">Rechazar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay pagos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg">Pago #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div><span className="text-gray-500">Pedido:</span> <span className="font-mono font-medium text-primary">#{selected.order}</span></div>
              <div><span className="text-gray-500">Método:</span> <span className="font-medium">{selected.method}</span></div>
              <div><span className="text-gray-500">Estado:</span> <span className="font-medium">{selected.status_display}</span></div>
              <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{new Date(selected.created_at).toLocaleString('es-AR')}</span></div>
              {selected.notes && <div><span className="text-gray-500">Notas:</span> <span>{selected.notes}</span></div>}
              {selected.voucher && (
                <div>
                  <span className="text-gray-500">Comprobante:</span>
                  <a href={selected.voucher} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">Ver comprobante</a>
                </div>
              )}

              {selected.status === 'pendiente' && (
                <div className="flex gap-3 pt-4">
                  <button onClick={() => handleVerify(selected.id, 'verificado')} className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors">Verificar</button>
                  <button onClick={() => handleVerify(selected.id, 'rechazado')} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">Rechazar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
