import { Link } from 'react-router-dom'
import type { Campaign } from '../types'

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const MEDIA = import.meta.env.VITE_API_URL || ''

  return (
    <Link
      to={`/campanas/${campaign.slug}`}
      className="no-underline group block bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {campaign.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={`${MEDIA}${campaign.image}`}
            alt={campaign.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      {!campaign.image && (
        <div
          className="aspect-video flex items-center justify-center text-5xl"
          style={{ backgroundColor: campaign.color + '20' }}
        >
          🎽
        </div>
      )}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-gray-900 mb-1">
          {campaign.name}
        </h3>
        {campaign.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: campaign.color || '#22C55E' }}
          >
            Ver productos
          </span>
        </div>
      </div>
    </Link>
  )
}
