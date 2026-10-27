import { canOrder, missingRequiredGroup, selectedOptions, unitPriceInCents } from '../catalog/pricing'
import type { Product, Selections } from '../catalog/types'

export interface CartItem {
  key: string
  productId: string
  selections: Selections
  quantity: number
  /** Nome no momento da adição, usado só para avisar se o produto sumir do catálogo. */
  nameSnapshot: string
}

export interface CartLine extends CartItem {
  product: Product
  variantLabel: string | null
  unitPriceInCents: number | null
  lineTotalInCents: number | null
}

export interface CartSummary {
  totalUnits: number
  lineCount: number
  pricedSubtotalInCents: number
  allPriced: boolean
  hasUnpriced: boolean
}

export const lineKey = (productId: string, selections: Selections) =>
  [productId, ...Object.keys(selections).sort().map((g) => `${g}=${selections[g]}`)].join('|')

/** Inteiro entre 1 e max; qualquer outra coisa (NaN, negativo, fração) é inválida. */
export function sanitizeQuantity(value: unknown, max: number): number | null {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) return null
  return Math.min(n, max)
}

export function addItem(
  items: CartItem[],
  product: Product,
  selections: Selections,
  quantity: number,
  max: number,
): CartItem[] {
  const qty = sanitizeQuantity(quantity, max)
  if (qty === null || !canOrder(product) || missingRequiredGroup(product, selections)) return items
  const key = lineKey(product.id, selections)
  const existing = items.find((i) => i.key === key)
  if (existing) {
    return items.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + qty, max) } : i))
  }
  return [...items, { key, productId: product.id, selections: { ...selections }, quantity: qty, nameSnapshot: product.name }]
}

export function setQuantity(items: CartItem[], key: string, quantity: number, max: number): CartItem[] {
  if (quantity <= 0) return removeItem(items, key)
  const qty = sanitizeQuantity(quantity, max)
  if (qty === null) return items
  return items.map((i) => (i.key === key ? { ...i, quantity: qty } : i))
}

export const removeItem = (items: CartItem[], key: string) => items.filter((i) => i.key !== key)

/* ---------- Persistência ---------- */

export const CART_STORAGE_KEY = 'donono:cart:v1'

export const serializeCart = (items: CartItem[]) =>
  JSON.stringify({
    version: 1,
    items: items.map(({ productId, selections, quantity, nameSnapshot }) => ({ productId, selections, quantity, nameSnapshot })),
  })

/** Lê o carrinho salvo. Dados corrompidos viram carrinho vazio com aviso. */
export function parseStoredCart(raw: string | null): { items: CartItem[]; corrupted: boolean } {
  if (!raw) return { items: [], corrupted: false }
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null || !Array.isArray((data as { items?: unknown }).items)) {
      return { items: [], corrupted: true }
    }
    let corrupted = false
    const items: CartItem[] = []
    for (const entry of (data as { items: unknown[] }).items) {
      const e = entry as Record<string, unknown>
      const selections = e?.selections
      const validSelections =
        typeof selections === 'object' && selections !== null && !Array.isArray(selections) &&
        Object.values(selections).every((v) => typeof v === 'string')
      if (typeof e?.productId !== 'string' || !validSelections || !Number.isInteger(e.quantity) || (e.quantity as number) < 1) {
        corrupted = true
        continue
      }
      const sel = selections as Selections
      items.push({
        key: lineKey(e.productId, sel),
        productId: e.productId,
        selections: sel,
        quantity: e.quantity as number,
        nameSnapshot: typeof e.nameSnapshot === 'string' ? e.nameSnapshot : 'Um produto',
      })
    }
    return { items, corrupted }
  } catch {
    return { items: [], corrupted: true }
  }
}

/**
 * Confere o carrinho com o catálogo atual: remove itens que sumiram,
 * ficaram indisponíveis ou cujas variações mudaram, e limita quantidades.
 * Preços nunca vêm do armazenamento; são sempre recalculados pelo catálogo.
 */
export function reconcileCart(items: CartItem[], products: Product[], max: number) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const notices: string[] = []
  const merged = new Map<string, CartItem>()
  for (const item of items) {
    const product = byId.get(item.productId)
    if (!product) {
      notices.push(`${item.nameSnapshot} não está mais no catálogo e foi retirado da seleção.`)
      continue
    }
    if (!canOrder(product)) {
      notices.push(`${product.name} está indisponível no momento e foi retirado da seleção.`)
      continue
    }
    const groups = product.variants ?? []
    const selectionsOk =
      Object.keys(item.selections).every((gid) => {
        const g = groups.find((x) => x.id === gid)
        return g?.options.some((o) => o.active && o.id === item.selections[gid])
      }) && !missingRequiredGroup(product, item.selections)
    if (!selectionsOk) {
      notices.push(`A opção escolhida de ${product.name} mudou. Selecione-a novamente.`)
      continue
    }
    const quantity = Math.min(item.quantity, max)
    if (quantity !== item.quantity) notices.push(`A quantidade de ${product.name} foi ajustada para ${max}.`)
    const prev = merged.get(item.key)
    merged.set(item.key, {
      ...item,
      nameSnapshot: product.name,
      quantity: prev ? Math.min(prev.quantity + quantity, max) : quantity,
    })
  }
  return { items: [...merged.values()], notices }
}

export function buildLines(items: CartItem[], products: Product[]): CartLine[] {
  const byId = new Map(products.map((p) => [p.id, p]))
  return items.flatMap((item) => {
    const product = byId.get(item.productId)
    if (!product) return []
    const options = selectedOptions(product, item.selections)
    const unit = unitPriceInCents(product, item.selections)
    return [
      {
        ...item,
        product,
        variantLabel: options.length ? options.map((o) => o.option.name).join(' / ') : null,
        unitPriceInCents: unit,
        lineTotalInCents: unit === null ? null : unit * item.quantity,
      },
    ]
  })
}

export function summarize(lines: CartLine[]): CartSummary {
  const priced = lines.filter((l) => l.lineTotalInCents !== null)
  return {
    totalUnits: lines.reduce((sum, l) => sum + l.quantity, 0),
    lineCount: lines.length,
    pricedSubtotalInCents: priced.reduce((sum, l) => sum + (l.lineTotalInCents ?? 0), 0),
    allPriced: lines.length > 0 && priced.length === lines.length,
    hasUnpriced: priced.length < lines.length,
  }
}
