import { Check, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { canOrder, missingRequiredGroup, unitPriceInCents } from '../catalog/pricing'
import type { Product, Selections } from '../catalog/types'
import { settings } from '../config/company'
import { formatBRL } from '../lib/money'
import { useCart } from '../state/CartContext'
import { Dialog } from './Dialog'
import { AvailabilityNote, DemoTag, PriceLabel } from './Price'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'

export function ProductDialog({ product, onClose }: { product: Product | null; onClose: () => void }) {
  return (
    <Dialog open={product !== null} onClose={onClose} title={product?.name ?? 'Produto'} hideTitle>
      {product && <ProductDetails key={product.id} product={product} onDone={onClose} />}
    </Dialog>
  )
}

function ProductDetails({ product, onDone }: { product: Product; onDone: () => void }) {
  const { add } = useCart()
  const [selections, setSelections] = useState<Selections>(() => {
    // Grupo com uma única opção ativa já vem selecionado.
    const initial: Selections = {}
    for (const g of product.variants ?? []) {
      const active = g.options.filter((o) => o.active)
      if (active.length === 1) initial[g.id] = active[0].id
    }
    return initial
  })
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const groupRefs = useRef<Record<string, HTMLFieldSetElement | null>>({})

  const orderable = canOrder(product)
  const missing = missingRequiredGroup(product, selections)
  const unit = missing ? null : unitPriceInCents(product, selections)
  const max = settings.maxQuantityPerItem

  const submit = () => {
    if (missing) {
      setError(`Escolha uma opção em “${missing.name}”.`)
      groupRefs.current[missing.id]?.querySelector('input')?.focus()
      return
    }
    if (add(product, selections, quantity)) onDone()
  }

  return (
    <div className="grid md:grid-cols-2">
      <ProductImage product={product} priority className="aspect-[4/3] w-full md:aspect-auto md:h-full md:min-h-[28rem]" />

      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div className="pr-10">
          {settings.demoMode && product.isDemo && (
            <div className="mb-3">
              <DemoTag />
            </div>
          )}
          <h2 className="text-3xl leading-tight font-semibold">{product.name}</h2>
          {product.sellingUnit && <p className="mt-1 text-sm text-marrom-suave">Vendido por {product.sellingUnit}</p>}
        </div>

        {product.description && <p className="leading-relaxed text-marrom-suave">{product.description}</p>}
        <AvailabilityNote availability={product.availability} />

        {(product.variants ?? []).map((group) => (
          <fieldset
            key={group.id}
            ref={(el) => {
              groupRefs.current[group.id] = el
            }}
            aria-describedby={error && missing?.id === group.id ? 'erro-variacao' : undefined}
          >
            <legend className="label">
              {group.name}
              {group.required ? <span className="font-normal text-marrom-suave"> (obrigatório)</span> : <span className="font-normal text-marrom-suave"> (opcional)</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const checked = selections[group.id] === option.id
                return (
                  <label
                    key={option.id}
                    className={`relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dourado ${
                      !option.active
                        ? 'cursor-not-allowed border-marrom/10 text-marrom/40 line-through'
                        : checked
                          ? 'border-verde bg-verde text-white'
                          : 'border-marrom/20 bg-white text-marrom hover:border-verde'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`variante-${group.id}`}
                      value={option.id}
                      checked={checked}
                      disabled={!option.active}
                      onChange={() => {
                        setSelections((s) => ({ ...s, [group.id]: option.id }))
                        setError(null)
                      }}
                      className="sr-only"
                    />
                    {checked && <Check aria-hidden size={16} />}
                    {option.name}
                    {option.priceInCents !== undefined && <span className="font-normal opacity-80">· {formatBRL(option.priceInCents)}</span>}
                  </label>
                )
              })}
              {!group.required && selections[group.id] && (
                <button
                  type="button"
                  className="min-h-11 px-2 text-sm font-semibold text-verde underline underline-offset-4"
                  onClick={() =>
                    setSelections((s) => {
                      const next = { ...s }
                      delete next[group.id]
                      return next
                    })
                  }
                >
                  Limpar
                </button>
              )}
            </div>
          </fieldset>
        ))}

        {error && (
          <p id="erro-variacao" role="alert" className="text-sm font-semibold text-terracota-texto">
            {error}
          </p>
        )}

        <div className="mt-auto border-t border-marrom/10 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <QuantityStepper value={quantity} max={max} onChange={(q) => setQuantity(Math.max(1, Math.min(q, max)))} label={product.name} />
            <div className="text-right">
              {unit !== null ? (
                <>
                  <p className="text-xl font-semibold text-verde">{formatBRL(unit * quantity)}</p>
                  {quantity > 1 && <p className="text-xs text-marrom-suave">{formatBRL(unit)} cada</p>}
                </>
              ) : missing ? (
                <PriceLabel product={product} />
              ) : (
                <p className="text-sm font-semibold text-marrom-suave">Preço sob consulta</p>
              )}
            </div>
          </div>
          <button type="button" onClick={submit} disabled={!orderable} className="btn-primary mt-5 w-full text-base">
            {orderable ? (
              <>
                <Plus aria-hidden size={18} /> Adicionar à seleção
              </>
            ) : (
              'Indisponível no momento'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
