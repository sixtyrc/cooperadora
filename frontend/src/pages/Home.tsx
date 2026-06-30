import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Institution, Campaign } from '../types'
import CampaignCard from '../components/CampaignCard'

export default function Home() {
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getInstitution(), api.getCampaigns()])
      .then(([inst, camps]) => {
        setInstitution(inst)
        setCampaigns(camps.filter(c => c.is_visible))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4">
            {institution?.name || 'Cooperadora Online'}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {institution?.welcome_message || 'Participá de las campañas de la cooperadora de forma simple y rápida.'}
          </p>
          <Link
            to="/campanas"
            className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all no-underline text-lg"
          >
            Ver campañas activas
          </Link>
        </div>
      </section>

      {/* Campañas */}
      {campaigns.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6 text-center">
            Campañas disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      )}

      {campaigns.length === 0 && (
        <section className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400 text-lg">
            No hay campañas activas en este momento.
          </p>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
            ¿Tenés un pedido?
          </h2>
          <p className="text-gray-500 mb-6">
            Consultá el estado de tu pedido con el código que recibiste.
          </p>
          <Link
            to="/consultar"
            className="inline-block bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-primary-dark transition-colors no-underline"
          >
            Consultar pedido
          </Link>
        </div>
      </section>
    </div>
  )
}
