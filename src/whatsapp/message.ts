import type { CartLine, CartSummary } from '../cart/cart'
import { formatBRL } from '../lib/money'

export interface CustomerInfo {
  name?: string
  date?: string
  notes?: string
}

export interface CoffeeBreakInfo {
  eventType?: string
  date?: string
  people?: string
  notes?: string
}

const clean = (text?: string) => (text ?? '').replace(/\r\n?/g, '\n').trim()

/** "2026-11-05" → "05/11/2026". Outros formatos são mantidos como digitados. */
export function formatDate(value?: string) {
  const v = clean(value)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v
}

function customerBlock(info: { name?: string; date?: string; notes?: string }) {
  const out: string[] = []
  if (clean(info.name)) out.push(`Nome: ${clean(info.name)}`)
  if (clean(info.date)) out.push(`Data desejada: ${formatDate(info.date)} (preferência, sujeita à confirmação)`)
  if (clean(info.notes)) out.push(`Observações: ${clean(info.notes)}`)
  return out
}

export function buildSelectionMessage(lines: CartLine[], summary: CartSummary, customer: CustomerInfo = {}) {
  const parts: string[] = ['Olá! Gostaria de consultar esta seleção de produtos Do Nono:', '']
  lines.forEach((line, index) => {
    parts.push(`${index + 1}. ${line.product.name}`)
    if (line.variantLabel) parts.push(`Variação: ${line.variantLabel}`)
    const unit = line.product.sellingUnit ? ` × ${line.product.sellingUnit}` : ''
    parts.push(`Quantidade: ${line.quantity}${unit}`)
    if (line.unitPriceInCents !== null && line.lineTotalInCents !== null) {
      parts.push(`Preço unitário: ${formatBRL(line.unitPriceInCents)} · Subtotal: ${formatBRL(line.lineTotalInCents)}`)
    } else {
      parts.push('Preço: sob consulta')
    }
    parts.push('')
  })
  if (summary.allPriced) {
    parts.push(`Subtotal dos produtos: ${formatBRL(summary.pricedSubtotalInCents)}`)
  } else if (summary.pricedSubtotalInCents > 0) {
    parts.push(`Subtotal dos itens com preço: ${formatBRL(summary.pricedSubtotalInCents)}`)
    parts.push('Há itens sob consulta; o valor final depende da confirmação de vocês.')
  }
  const extra = customerBlock(customer)
  if (extra.length) parts.push('', ...extra)
  parts.push('', 'Podem confirmar a disponibilidade e o valor final?')
  return parts.join('\n')
}

export function buildCoffeeBreakMessage(info: CoffeeBreakInfo) {
  const parts = ['Olá! Gostaria de consultar a Do Nono sobre produtos para um evento.']
  const details: string[] = []
  if (clean(info.eventType)) details.push(`Tipo de evento: ${clean(info.eventType)}`)
  if (clean(info.date)) details.push(`Data desejada: ${formatDate(info.date)} (preferência, sujeita à confirmação)`)
  if (clean(info.people)) details.push(`Número de pessoas: ${clean(info.people)}`)
  if (clean(info.notes)) details.push(`Observações: ${clean(info.notes)}`)
  if (details.length) parts.push('', ...details)
  parts.push('', 'Podem me passar as opções disponíveis?')
  return parts.join('\n')
}

export const buildWhatsAppUrl = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`

export const SHORT_INTRO = 'Olá! Montei uma seleção de produtos Do Nono no site e vou colar a lista completa aqui.'

/**
 * Decide como abrir o WhatsApp sem truncar a mensagem: se a URL ficar longa
 * demais, abre só com uma introdução e o cliente cola a lista copiada.
 */
export function planWhatsApp(number: string, text: string, maxUrlLength: number) {
  if (!number) return { status: 'unconfigured' as const }
  const url = buildWhatsAppUrl(number, text)
  if (url.length <= maxUrlLength) return { status: 'direct' as const, url }
  return { status: 'too_long' as const, url: buildWhatsAppUrl(number, SHORT_INTRO) }
}
