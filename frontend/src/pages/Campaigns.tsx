import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Campaign } from '../types'
import CampaignCard from '../components/CampaignCard'

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCampaigns()
      .then(camps => setCampaigns(camps.filter(c => c.is_visible)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Cargando campañas...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8 text-center">
        Campañas
      </h1>
      {campaigns.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No hay campañas activas.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}
