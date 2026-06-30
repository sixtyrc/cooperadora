import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Product, Campaign } from '../types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filterCampaign, setFilterCampaign] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    campaign: 0, name: '', description: '', price: '', cost: '', order: 0, is_active: true
  })

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.getAdminProducts(filterCampaign || undefined),
      api.getAdminCampaigns()
    ]).then(([p, c]) => { setProducts(p); setCampaigns(c) })
      .finally(() => setLoading(false))
  }, [filterCampaign])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditing(null)
    setImageFile(null)
    setForm({ campaign: campaigns[0]?.id || 0, name: '', description: '', price: '', cost: '', order: 0, is_active: true })
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setImageFile(null)
    setForm({
      campaign: (p as Product & { campaign?: number }).campaign || 0,
      name: p.name, description: p.description, price: p.price,
      cost: p.cost || '0', order: p.order, is_active: true
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('campaign', String(form.campaign))
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('price', form.price)
    fd.append('cost', form.cost || '0')
    fd.append('order', String(form.order))
    fd.append('is_active', String(form.is_active))
    if (imageFile) fd.append('image', imageFile)
    if (editing) {
      await api.updateProduct(editing.id, fd)
    } else {
      await api.createProduct(fd)
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
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Costo</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Precio</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Ganancia</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Orden</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const cost = parseFloat(p.cost || '0')
                  const price = parseFloat(p.price || '0')
                  const profit = price - cost
                  return (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium">{p.name}</td>
                      <td className="px-5 py-3 text-gray-500">${cost.toFixed(2)}</td>
                      <td className="px-5 py-3">${price.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className={`font-medium ${profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          ${profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{p.order}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="text-primary hover:text-primary-dark mr-3 text-sm">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No hay productos</td></tr>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                  <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input type="number" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                  <p className="text-xs text-gray-400 mt-1">Número menor = aparece primero en la tienda. Dejar en 0 para orden alfabético.</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del producto</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {editing?.image && !imageFile && (
                  <p className="text-xs text-gray-400 mt-1">Actual: {editing.image.split('/').pop()}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG o PNG — Se comprime automáticamente</p>
              </div>
              {form.cost && form.price && (
                <div className="text-sm text-gray-500">
                  Ganancia unitaria: <span className={`font-bold ${parseFloat(form.price) - parseFloat(form.cost || '0') >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${(parseFloat(form.price) - parseFloat(form.cost || '0')).toFixed(2)}
                  </span>
                </div>
              )}
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
