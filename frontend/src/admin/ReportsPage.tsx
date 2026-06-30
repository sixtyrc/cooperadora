import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { DashboardData, CampaignReport, ProductReport, ClassroomReport, FinancialReport, Campaign } from '../types'

interface Filters {
  campaign: string
  date_from: string
  date_to: string
}

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignReport[]>([])
  const [products, setProducts] = useState<ProductReport[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomReport[]>([])
  const [financial, setFinancial] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')
  const [campaignList, setCampaignList] = useState<Campaign[]>([])
  const [filters, setFilters] = useState<Filters>({ campaign: '', date_from: '', date_to: '' })

  const load = (f: Filters) => {
    setLoading(true)
    const params = { campaign: f.campaign || undefined, date_from: f.date_from || undefined, date_to: f.date_to || undefined }
    Promise.all([
      api.getDashboard(params),
      api.getReportsCampaigns(params),
      api.getReportsProducts(params),
      api.getReportsClassrooms(params),
      api.getReportsFinancial(params)
    ]).then(([d, c, p, cl, fi]) => {
      setDashboard(d)
      setCampaigns(c)
      setProducts(p)
      setClassrooms(cl)
      setFinancial(fi)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(filters) }, [filters])

  useEffect(() => {
    api.getAdminCampaigns().then(setCampaignList)
  }, [])

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(type)
    try {
      const blob = type === 'excel' ? await api.exportExcel() : await api.exportPdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte.${type === 'excel' ? 'xlsx' : 'pdf'}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting('')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Reportes</h1>
        <div className="flex gap-3">
          <button onClick={() => handleExport('excel')} disabled={!!exporting} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50">
            {exporting === 'excel' ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button onClick={() => handleExport('pdf')} disabled={!!exporting} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50">
            {exporting === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap gap-4 items-end">
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
        <button onClick={() => setFilters({ campaign: '', date_from: '', date_to: '' })} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
          Limpiar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando reportes...</div>
      ) : (
        <>
          {dashboard && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-md p-5">
                <p className="text-sm text-gray-500">Total Pedidos</p>
                <p className="text-3xl font-bold text-gray-900">{dashboard.total_orders}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-5">
                <p className="text-sm text-gray-500">Ventas Totales</p>
                <p className="text-3xl font-bold text-primary">${dashboard.total_sales}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-5">
                <p className="text-sm text-gray-500">Cobros</p>
                <p className="text-3xl font-bold text-green-600">${dashboard.total_collected}</p>
              </div>
            </div>
          )}

          {/* Reporte Financiero */}
          {financial && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h2 className="font-heading font-bold text-gray-900 text-lg mb-4">Reporte Financiero</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Efectivo</p>
                  <p className="text-xl font-bold text-green-600">${financial.total_collected_cash}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Transferencia</p>
                  <p className="text-xl font-bold text-blue-600">${financial.total_collected_transfer}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Costo Proveedor</p>
                  <p className="text-xl font-bold text-orange-600">${financial.total_cost}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Ganancia</p>
                  <p className={`text-xl font-bold ${parseFloat(financial.total_profit) >= 0 ? 'text-green-600' : 'text-red-500'}`}>${financial.total_profit}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Margen</p>
                  <p className="text-xl font-bold text-primary">{financial.profit_margin}%</p>
                </div>
              </div>
              {financial.by_campaign.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2 font-medium text-gray-500">Campaña</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">Vendidos</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">Ventas</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">Costo</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-500">Ganancia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financial.by_campaign.map((c, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-4 py-2 font-medium">{c.name}</td>
                          <td className="px-4 py-2">{c.quantity_sold}</td>
                          <td className="px-4 py-2">${c.total_sales}</td>
                          <td className="px-4 py-2 text-orange-600">${c.total_cost}</td>
                          <td className={`px-4 py-2 font-medium ${parseFloat(c.total_profit) >= 0 ? 'text-green-600' : 'text-red-500'}`}>${c.total_profit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-heading font-bold text-gray-900">Por Campaña</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Campaña</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Pedidos</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-medium">{c.name}</td>
                        <td className="px-5 py-3">{c.total_orders}</td>
                        <td className="px-5 py-3">${c.total_sales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-heading font-bold text-gray-900">Por Producto</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Producto</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Campaña</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Vendidos</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-medium">{p.name}</td>
                        <td className="px-5 py-3 text-gray-500">{p.campaign}</td>
                        <td className="px-5 py-3">{p.total_quantity}</td>
                        <td className="px-5 py-3">${p.total_revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden lg:col-span-2">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-heading font-bold text-gray-900">Por Sala</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Sala</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Pedidos</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-medium">{c.classroom}</td>
                        <td className="px-5 py-3">{c.total_orders}</td>
                        <td className="px-5 py-3">{c.total_amount}</td>
                      </tr>
                    ))}
                    {classrooms.length === 0 && (
                      <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400">No hay datos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
