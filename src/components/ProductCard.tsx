import { Plus, SlidersHorizontal } from 'lucide-react'
import { canOrder } from '../catalog/pricing'
import type { Product } from '../catalog/types'
import { settings } from '../config/company'
import { useCart } from '../state/CartContext'
import { AvailabilityNote, DemoTag, PriceLabel } from './Price'
import { ProductImage } from './ProductImage'

export function ProductCard({ product, onOpen, priority }: { product: Product; onOpen: () => void; priority?: boolean }) {
  const { add } = useCart()
  const orderable = canOrder(product)
  const hasOptions = (product.variants?.length ?? 0) > 0

  return (
    <article className="group flex h-full flex-col">
      <button
        type="button"
        onClick={onOpen}
        className="relative block overflow-hidden rounded-2xl"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage
          product={product}
          priority={priority}
          className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {settings.demoMode && product.isDemo && (
          <span className="absolute top-3 left-3">
            <DemoTag />
          </span>
        )}
      </button>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-2xl leading-tight font-semibold">
          <button type="button" onClick={onOpen} className="text-left hover:underline hover:decoration-dourado hover:underline-offset-4">
            {product.name}
          </button>
        </h3>
        {product.description && <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-marrom-suave">{product.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <AvailabilityNote availability={product.availability} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <PriceLabel product={product} />
            {product.sellingUnit && <p className="text-sm text-marrom-suave">por {product.sellingUnit}</p>}
          </div>
          {!orderable ? (
            <span className="text-sm font-semibold text-marrom-suave">Indisponível</span>
          ) : hasOptions ? (
            <button type="button" onClick={onOpen} className="btn-secondary px-4">
              <SlidersHorizontal aria-hidden size={16} />
              Escolher opções
            </button>
          ) : (
            <button
              type="button"
              onClick={() => add(product, {}, 1)}
              className="btn-primary px-4"
              aria-label={`Adicionar ${product.name} à seleção`}
            >
              <Plus aria-hidden size={18} />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
