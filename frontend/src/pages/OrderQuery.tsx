import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Order } from '../types'

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  pendiente_pago: 'bg-orange-100 text-orange-700',
  pagado: 'bg-blue-100 text-blue-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
}

export default function OrderQuery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (c?: string) => {
    const queryCode = c || code
    if (!queryCode.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await api.getOrder(queryCode.trim())
      setOrder(res)
      setSearchParams({ code: queryCode.trim() })
    } catch {
      setError('No se encontró un pedido con ese código.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initial = searchParams.get('code')
    if (initial) {
      setCode(initial)
      search(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-6 text-center">
        Consultar pedido
      </h1>

      <form
        onSubmit={e => { e.preventDefault(); search() }}
        className="flex gap-3 mb-8"
      >
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Ej: PZA-2026-000001"
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white font-bold px-6 py-3 rounded-2xl transition-colors"
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm mb-6 text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-gray-900">{order.code}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status_display}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-400">Nombre</span>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <span className="text-gray-400">Teléfono</span>
              <p className="font-medium text-gray-900">{order.phone}</p>
            </div>
            <div>
              <span className="text-gray-400">Alumno/a</span>
              <p className="font-medium text-gray-900">{order.student_name}</p>
            </div>
            <div>
              <span className="text-gray-400">Sala</span>
              <p className="font-medium text-gray-900">{order.classroom}</p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Productos</h3>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">
                    {item.product_detail.name} x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${Number(item.subtotal).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-primary">${Number(order.total).toLocaleString('es-AR')}</span>
              </div>
            </div>
          )}

          {order.notes && (
            <div className="mt-4 text-sm">
              <span className="text-gray-400">Observaciones: </span>
              <span className="text-gray-600">{order.notes}</span>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-400">
            Creado: {new Date(order.created_at).toLocaleString('es-AR')}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-gray-400 no-underline hover:text-gray-600">
          &larr; Volver al inicio
        </Link>
      </div>
    </div>
  )
}
