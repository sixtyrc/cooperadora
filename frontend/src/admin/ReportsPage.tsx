import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { DashboardData, CampaignReport, ProductReport, ClassroomReport } from '../types'

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignReport[]>([])
  const [products, setProducts] = useState<ProductReport[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomReport[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')

  useEffect(() => {
    Promise.all([
      api.getDashboard(),
      api.getReportsCampaigns(),
      api.getReportsProducts(),
      api.getReportsClassrooms()
    ]).then(([d, c, p, cl]) => {
      setDashboard(d)
      setCampaigns(c)
      setProducts(p)
      setClassrooms(cl)
    }).finally(() => setLoading(false))
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

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando reportes...</div>

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
    </div>
  )
}
