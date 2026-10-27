import { Coffee, CookingPot, Wheat } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../catalog/types'

const ICONS: Record<string, typeof Wheat> = { massas: CookingPot, paes: Wheat, 'coffee-break': Coffee }

interface Props {
  product: Product
  className?: string
  priority?: boolean
}

/** Foto do produto com espaço reservado discreto quando ainda não há imagem ou ela falha. */
export function ProductImage({ product, className = '', priority }: Props) {
  const [failed, setFailed] = useState(false)
  const alt = product.imageAlt ?? product.name

  if (!product.image || failed) {
    const Icon = ICONS[product.categoryId] ?? Wheat
    return (
      <div role="img" aria-label={alt} className={`grid place-items-center bg-creme-fundo ${className}`}>
        <div className="flex flex-col items-center gap-2 text-verde/35">
          <Icon aria-hidden size={44} strokeWidth={1.25} />
          <span className="text-xs font-semibold tracking-wide text-marrom-suave/70">Foto em breve</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={product.image}
      alt={alt}
      width={800}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`bg-creme-fundo object-cover ${className}`}
    />
  )
}
