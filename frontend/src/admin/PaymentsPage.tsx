import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Payment, Campaign } from '../types'

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'verificado', label: 'Verificado' },
  { value: 'rechazado', label: 'Rechazado' },
]

interface Filters {
  status: string
  campaign: string
  date_from: string
  date_to: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filters, setFilters] = useState<Filters>({ status: '', campaign: '', date_from: '', date_to: '' })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Payment | null>(null)
  const [campaignList, setCampaignList] = useState<Campaign[]>([])

  const load = (f: Filters) => {
    setLoading(true)
    api.getAdminPayments({
      status: f.status || undefined,
      campaign: f.campaign || undefined,
      date_from: f.date_from || undefined,
      date_to: f.date_to || undefined,
    }).then(setPayments).finally(() => setLoading(false))
  }

  useEffect(() => { load(filters) }, [filters])

  useEffect(() => {
    api.getAdminCampaigns().then(setCampaignList)
  }, [])

  const handleVerify = async (id: number, status: string) => {
    await api.updatePayment(id, { status } as Partial<Payment>)
    load(filters)
    setSelected(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Pagos</h1>
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
                  <th className="text-left px-5 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Pedido</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Nombre</th>
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
                    <td className="px-5 py-3 text-gray-700">{p.customer_name}</td>
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
              <div><span className="text-gray-500">Cliente:</span> <span className="font-medium">{selected.customer_name}</span></div>
              <div><span className="text-gray-500">Método:</span> <span className="font-medium">{selected.method_display}</span></div>
              <div><span className="text-gray-500">Estado:</span> <span className="font-medium">{selected.status_display}</span></div>
              <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{new Date(selected.created_at).toLocaleString('es-AR')}</span></div>
              {selected.notes && <div><span className="text-gray-500">Notas:</span> <span>{selected.notes}</span></div>}
              {selected.voucher && (
                <div>
                  <span className="text-gray-500">Comprobante:</span>
                  <a href={selected.voucher} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">Ver comprobante</a>
                </div>
              )}

              {(selected.ocr_name || selected.ocr_dni || selected.ocr_amount) && (
                <div className="bg-blue-50 rounded-xl p-3 mt-3 space-y-1">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Datos del comprobante (OCR)</p>
                  {selected.ocr_name && <p><span className="text-gray-500">Nombre titular:</span> <span className="font-medium">{selected.ocr_name}</span></p>}
                  {selected.ocr_dni && <p><span className="text-gray-500">DNI/CUIL:</span> <span className="font-medium">{selected.ocr_dni}</span></p>}
                  {selected.ocr_amount && <p><span className="text-gray-500">Monto:</span> <span className="font-medium">${Number(selected.ocr_amount).toLocaleString('es-AR')}</span></p>}
                  {selected.ocr_date && <p><span className="text-gray-500">Fecha:</span> <span className="font-medium">{selected.ocr_date}</span></p>}
                  {selected.ocr_operation_id && <p><span className="text-gray-500">Operación:</span> <span className="font-medium">{selected.ocr_operation_id}</span></p>}
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
