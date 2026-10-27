import { ArrowLeft, Info, ShoppingBag, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { settings } from '../config/company'
import { formatBRL } from '../lib/money'
import { useCart } from '../state/CartContext'
import { buildSelectionMessage, type CustomerInfo } from '../whatsapp/message'
import { Dialog } from './Dialog'
import { ProductImage } from './ProductImage'
import { QuantityStepper } from './QuantityStepper'
import { SendActions } from './SendActions'

export function CartDrawer() {
  const { isOpen, closeCart } = useCart()
  return (
    <Dialog open={isOpen} onClose={closeCart} title="Sua seleção" variant="drawer">
      <CartContent />
    </Dialog>
  )
}

function CartContent() {
  const { lines, summary, notices, dismissNotices, setQuantity, remove, clear, closeCart } = useCart()
  const [step, setStep] = useState<'review' | 'send'>('review')
  const [confirmClear, setConfirmClear] = useState(false)
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', date: '', notes: '' })

  const empty = lines.length === 0
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex min-h-full flex-col">
      {notices.length > 0 && (
        <div role="status" className="mx-5 mb-3 flex gap-3 rounded-xl bg-dourado/15 p-3 text-sm text-marrom">
          <Info aria-hidden size={18} className="mt-0.5 shrink-0" />
          <ul className="flex-1 space-y-1">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button type="button" onClick={dismissNotices} className="-m-2 grid size-10 shrink-0 place-items-center" aria-label="Dispensar avisos">
            <X aria-hidden size={16} />
          </button>
        </div>
      )}

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
          <ShoppingBag aria-hidden size={40} strokeWidth={1.25} className="text-verde/40" />
          <p className="mt-4 font-serif text-2xl text-verde">Sua seleção está vazia</p>
          <p className="mt-2 text-marrom-suave">Escolha produtos no catálogo para montar sua consulta.</p>
          <a href="#produtos" onClick={closeCart} className="btn-primary mt-6">
            Explorar produtos
          </a>
        </div>
      ) : step === 'review' ? (
        <>
          <ul className="flex-1 divide-y divide-marrom/10 px-5">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-4">
                <ProductImage product={line.product} className="size-20 shrink-0 rounded-xl [&_span]:hidden [&_svg]:size-7" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-serif text-lg leading-snug font-semibold text-verde">{line.product.name}</p>
                      {line.variantLabel && <p className="text-sm text-marrom-suave">{line.variantLabel}</p>}
                      {line.product.sellingUnit && <p className="text-sm text-marrom-suave">por {line.product.sellingUnit}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-marrom-suave hover:bg-marrom/5 hover:text-terracota-texto"
                      aria-label={`Remover ${line.product.name}${line.variantLabel ? ` (${line.variantLabel})` : ''}`}
                    >
                      <Trash2 aria-hidden size={18} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <QuantityStepper
                      size="sm"
                      value={line.quantity}
                      min={1}
                      max={settings.maxQuantityPerItem}
                      onChange={(q) => setQuantity(line.key, q)}
                      label={`${line.product.name}${line.variantLabel ? ` ${line.variantLabel}` : ''}`}
                    />
                    <div className="text-right text-sm">
                      {line.lineTotalInCents !== null && line.unitPriceInCents !== null ? (
                        <>
                          <p className="font-semibold text-verde">{formatBRL(line.lineTotalInCents)}</p>
                          <p className="text-xs text-marrom-suave">{formatBRL(line.unitPriceInCents)} cada</p>
                        </>
                      ) : (
                        <p className="font-semibold text-marrom-suave">Sob consulta</p>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="sticky bottom-0 border-t border-marrom/10 bg-creme px-5 pt-4 pb-5">
            <Totals />
            <button type="button" onClick={() => setStep('send')} className="btn-primary mt-4 w-full text-base">
              Revisar e enviar
            </button>
            <div className="mt-2 flex justify-center">
              {confirmClear ? (
                <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
                  Esvaziar a seleção?
                  <button type="button" className="btn-ghost min-h-10 px-3 text-terracota-texto" onClick={() => { clear(); setConfirmClear(false) }}>
                    Sim, esvaziar
                  </button>
                  <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => setConfirmClear(false)}>
                    Cancelar
                  </button>
                </p>
              ) : (
                <button type="button" className="btn-ghost min-h-10 text-sm text-marrom-suave" onClick={() => setConfirmClear(true)}>
                  Limpar seleção
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 space-y-5 px-5 pb-6">
          <button type="button" onClick={() => setStep('review')} className="btn-ghost -ml-3 px-3">
            <ArrowLeft aria-hidden size={18} /> Voltar aos itens
          </button>
          <p className="text-sm text-marrom-suave">
            {summary.lineCount} {summary.lineCount === 1 ? 'item' : 'itens'} · {summary.totalUnits} {summary.totalUnits === 1 ? 'unidade' : 'unidades'}
          </p>
          <Totals />

          <div>
            <label htmlFor="cliente-nome" className="label">
              Seu nome <span className="font-normal text-marrom-suave">(opcional)</span>
            </label>
            <input id="cliente-nome" className="field" autoComplete="name" maxLength={80} value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="cliente-data" className="label">
              Data desejada <span className="font-normal text-marrom-suave">(opcional)</span>
            </label>
            <input id="cliente-data" type="date" min={today} className="field" aria-describedby="cliente-data-ajuda" value={customer.date} onChange={(e) => setCustomer((c) => ({ ...c, date: e.target.value }))} />
            <p id="cliente-data-ajuda" className="mt-1 text-xs text-marrom-suave">
              É uma preferência; a data é confirmada pelo atendimento.
            </p>
          </div>
          <div>
            <label htmlFor="cliente-obs" className="label">
              Observações <span className="font-normal text-marrom-suave">(opcional)</span>
            </label>
            <textarea id="cliente-obs" rows={3} maxLength={600} className="field" value={customer.notes} onChange={(e) => setCustomer((c) => ({ ...c, notes: e.target.value }))} />
          </div>

          <SendActions message={buildSelectionMessage(lines, summary, customer)} primaryLabel="Enviar seleção pelo WhatsApp" disabled={empty} />
        </div>
      )}
    </div>
  )
}

function Totals() {
  const { summary } = useCart()
  if (summary.allPriced) {
    return (
      <div>
        <p className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">Subtotal dos produtos</span>
          <span className="text-lg font-semibold text-verde">{formatBRL(summary.pricedSubtotalInCents)}</span>
        </p>
        <p className="mt-1 text-xs text-marrom-suave">Entrega e condições são confirmadas pelo atendimento.</p>
      </div>
    )
  }
  return (
    <div>
      {summary.pricedSubtotalInCents > 0 && (
        <p className="flex items-baseline justify-between gap-3">
          <span className="font-semibold">Subtotal dos itens com preço</span>
          <span className="text-lg font-semibold text-verde">{formatBRL(summary.pricedSubtotalInCents)}</span>
        </p>
      )}
      <p className="mt-1 text-xs leading-relaxed text-marrom-suave">
        Há itens sob consulta. O valor final é informado pelo atendimento, junto com disponibilidade, entrega e condições.
      </p>
    </div>
  )
}
