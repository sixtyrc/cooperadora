import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Campaign, Product, OrderCreatePayload } from '../types'
import ProductCard from '../components/ProductCard'

export default function OrderForm() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [ quantities, setQuantities ] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    student_name: '',
    classroom: '',
    notes: '',
  })

  useEffect(() => {
    if (!slug) return
    Promise.all([api.getCampaign(slug), api.getCampaignProducts(slug)])
      .then(([c, p]) => {
        setCampaign(c)
        setProducts(p)
        const preselect = searchParams.get('product')
        if (preselect) {
          const id = Number(preselect)
          setQuantities({ [id]: 1 })
        }
      })
      .finally(() => setLoading(false))
  }, [slug, searchParams])

  const handleQuantity = (id: number, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: qty }))
  }

  const items = products
    .filter(p => (quantities[p.id] || 0) > 0)
    .map(p => ({ product: p.id, quantity: quantities[p.id] }))

  const total = items.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.product)
    return sum + (prod ? Number(prod.price) * item.quantity : 0)
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      setError('Agregá al menos un producto al pedido.')
      return
    }
    if (!form.customer_name || !form.phone || !form.student_name || !form.classroom) {
      setError('Completá todos los campos obligatorios.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const payload: OrderCreatePayload = {
        campaign: campaign!.id,
        ...form,
        items,
      }
      const res = await api.createOrder(payload)
      navigate(`/consultar?code=${encodeURIComponent(res.code)}&phone=${encodeURIComponent(form.phone)}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Cargando productos...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Campaña no encontrada</p>
        <Link to="/campanas" className="text-primary font-semibold no-underline">Volver</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to={`/campanas/${slug}`} className="text-sm text-gray-500 no-underline hover:text-gray-700 mb-4 inline-block">
        &larr; {campaign.name}
      </Link>
      <h1 className="font-heading text-2xl font-bold text-gray-900 mb-6">
        Hacer pedido
      </h1>

      {/* Productos */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-4">Elegí tus productos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              quantity={quantities[p.id] || 0}
              onQuantityChange={handleQuantity}
            />
          ))}
        </div>
      </section>

      {items.length > 0 && (
        <div className="bg-primary-light/30 rounded-2xl p-4 mb-6 text-center">
          <span className="text-gray-600">Total: </span>
          <span className="text-xl font-bold text-primary">
            ${total.toLocaleString('es-AR')}
          </span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-gray-900">Tus datos</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del padre/madre *</label>
          <input
            type="text"
            required
            value={form.customer_name}
            onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="Ej: 3624617500"
            required
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">10 números, sin espacios ni guiones.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del alumno/a *</label>
          <input
            type="text"
            required
            value={form.student_name}
            onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sala / Curso *</label>
          <input
            type="text"
            required
            value={form.classroom}
            onChange={e => setForm(f => ({ ...f, classroom: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm resize-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-bold py-3 rounded-2xl transition-colors text-lg"
        >
          {submitting ? 'Enviando...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  )
}
