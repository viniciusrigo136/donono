import { priceRange } from '../catalog/pricing'
import type { Availability, Product } from '../catalog/types'
import { formatBRL } from '../lib/money'

export function PriceLabel({ product, className = '' }: { product: Product; className?: string }) {
  const range = priceRange(product)
  if (!range) return <p className={`text-sm font-semibold text-marrom-suave ${className}`}>Preço sob consulta</p>
  const text = range.min === range.max && !range.partial ? formatBRL(range.min) : `a partir de ${formatBRL(range.min)}`
  return <p className={`font-semibold text-verde ${className}`}>{text}</p>
}

const AVAILABILITY_TEXT: Record<Availability, string | null> = {
  available: null,
  on_request: 'Disponibilidade a confirmar',
  unavailable: 'Indisponível no momento',
}

export function AvailabilityNote({ availability }: { availability: Availability }) {
  const text = AVAILABILITY_TEXT[availability]
  if (!text) return null
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        availability === 'unavailable' ? 'bg-marrom/10 text-marrom' : 'bg-dourado/20 text-marrom'
      }`}
    >
      {text}
    </span>
  )
}

export function DemoTag() {
  return (
    <span className="inline-flex rounded-full border border-terracota/40 bg-white px-2.5 py-1 text-xs font-semibold text-terracota-texto">
      Exemplo
    </span>
  )
}
