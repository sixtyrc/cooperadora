import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, Campaign } from '../types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filterCampaign, setFilterCampaign] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({
    campaign: 0, name: '', description: '', price: '', image: '', order: 0, is_active: true
  })

  const load = () => {
    setLoading(true)
    Promise.all([
      api.getAdminProducts(filterCampaign || undefined),
      api.getAdminCampaigns()
    ]).then(([p, c]) => { setProducts(p); setCampaigns(c) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterCampaign])

  const openNew = () => {
    setEditing(null)
    setForm({ campaign: campaigns[0]?.id || 0, name: '', description: '', price: '', image: '', order: 0, is_active: true })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ campaign: (p as Product & { campaign?: number }).campaign || 0, name: p.name, description: p.description, price: p.price, image: p.image || '', order: p.order, is_active: true })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await api.updateProduct(editing.id, form)
    } else {
      await api.createProduct(form)
    }
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    await api.deleteProduct(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-heading text-2xl font-bold text-gray-900">Productos</h1>
        <div className="flex items-center gap-3">
          <select value={filterCampaign} onChange={e => setFilterCampaign(Number(e.target.value))} className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary outline-none">
            <option value={0}>Todas las campañas</option>
            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={openNew} className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm">
            Nuevo Producto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Precio</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Orden</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3">${p.price}</td>
                    <td className="px-5 py-3 text-gray-500">{p.order}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(p)} className="text-primary hover:text-primary-dark mr-3 text-sm">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No hay productos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg">{editing ? 'Editar' : 'Nuevo'} Producto</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaña</label>
                <select value={form.campaign} onChange={e => setForm({...form, campaign: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" required>
                  <option value={0}>Seleccionar campaña</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
