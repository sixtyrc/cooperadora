import type { Product } from '../types'
import { mediaUrl } from '../api/media'

interface Props {
  product: Product
  quantity: number
  onQuantityChange: (id: number, qty: number) => void
}

export default function ProductCard({ product, quantity, onQuantityChange }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
      {product.image ? (
        <div className="aspect-square overflow-hidden">
          <img
            src={mediaUrl(product.image)}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gray-50 flex items-center justify-center text-4xl">
          🎽
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-heading font-bold text-gray-900 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 mb-3 flex-1">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-primary">
            ${Number(product.price).toLocaleString('es-AR')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(product.id, Math.max(0, quantity - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              onClick={() => onQuantityChange(product.id, quantity + 1)}
              className="w-8 h-8 rounded-full bg-primary hover:bg-primary-dark flex items-center justify-center text-white font-bold transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
