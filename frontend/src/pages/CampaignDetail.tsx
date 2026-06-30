import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Campaign, Product } from '../types'

export default function CampaignDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    Promise.all([api.getCampaign(slug), api.getCampaignProducts(slug)])
      .then(([c, p]) => {
        setCampaign(c)
        setProducts(p)
      })
      .catch(() => setError('Campaña no encontrada'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Cargando...</div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">{error || 'Campaña no encontrada'}</p>
        <Link to="/campanas" className="text-primary font-semibold no-underline">
          Volver a campañas
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div
        className="py-10 px-4"
        style={{ backgroundColor: (campaign.color || '#22C55E') + '15' }}
      >
        <div className="max-w-5xl mx-auto">
          <Link to="/campanas" className="text-sm text-gray-500 no-underline hover:text-gray-700 mb-4 inline-block">
            &larr; Campañas
          </Link>
          <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
            {campaign.name}
          </h1>
          {campaign.description && (
            <p className="text-gray-600 max-w-2xl">{campaign.description}</p>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {products.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">
            Esta campaña no tiene productos disponibles.
          </p>
        ) : (
          <>
            <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">
              Productos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => (
                <Link
                  key={p.id}
                  to={`/campanas/${slug}/pedir?product=${p.id}`}
                  className="no-underline"
                >
                  <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                    {p.image ? (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_API_URL || ''}${p.image}`}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-50 flex items-center justify-center text-4xl">
                        🎽
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-heading font-bold text-sm text-gray-900 truncate">{p.name}</h3>
                      <p className="text-primary font-bold mt-1">
                        ${Number(p.price).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                to={`/campanas/${slug}/pedir`}
                className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-2xl hover:bg-primary-dark transition-colors no-underline text-lg"
              >
                Hacer pedido
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
