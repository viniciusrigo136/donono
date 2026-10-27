import { describe, expect, it } from 'vitest'
import type { Product } from '../catalog/types'
import { parseCatalog } from '../catalog/validate'
import { parseBRLToCents } from '../lib/money'
import { buildCoffeeBreakMessage, buildSelectionMessage, planWhatsApp } from '../whatsapp/message'
import {
  addItem,
  type CartItem,
  buildLines,
  lineKey,
  parseStoredCart,
  reconcileCart,
  removeItem,
  sanitizeQuantity,
  serializeCart,
  setQuantity,
  summarize,
} from './cart'

const MAX = 99

const massa: Product = {
  id: 'massa',
  slug: 'massa',
  name: 'Massa fresca',
  categoryId: 'massas',
  sellingUnit: 'pacote',
  featured: false,
  active: true,
  availability: 'available',
  variants: [
    {
      id: 'formato',
      name: 'Formato',
      required: true,
      options: [
        { id: 'longo', name: 'Formato longo', priceInCents: 1800, active: true },
        { id: 'curto', name: 'Formato curto', priceInCents: 1650, active: true },
      ],
    },
  ],
}
const recheada: Product = { ...massa, id: 'recheada', slug: 'recheada', name: 'Massa recheada', variants: undefined }
const pao: Product = { ...recheada, id: 'pao', slug: 'pao', name: 'Pão', sellingUnit: 'unidade', priceInCents: 1250 }
const products = [massa, recheada, pao]

describe('carrinho', () => {
  it('soma adições repetidas do mesmo produto e mesma variação', () => {
    let items = addItem([], massa, { formato: 'longo' }, 1, MAX)
    items = addItem(items, massa, { formato: 'longo' }, 2, MAX)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(3)
  })

  it('separa variações diferentes em linhas distintas', () => {
    let items = addItem([], massa, { formato: 'longo' }, 1, MAX)
    items = addItem(items, massa, { formato: 'curto' }, 1, MAX)
    expect(items).toHaveLength(2)
  })

  it('exige variação obrigatória', () => {
    expect(addItem([], massa, {}, 1, MAX)).toHaveLength(0)
  })

  it('não adiciona produto indisponível', () => {
    expect(addItem([], { ...pao, availability: 'unavailable' }, {}, 1, MAX)).toHaveLength(0)
  })

  it('valida quantidades', () => {
    expect(sanitizeQuantity(NaN, MAX)).toBeNull()
    expect(sanitizeQuantity(-2, MAX)).toBeNull()
    expect(sanitizeQuantity(1.5, MAX)).toBeNull()
    expect(sanitizeQuantity('abc', MAX)).toBeNull()
    expect(sanitizeQuantity('3', MAX)).toBe(3)
    expect(sanitizeQuantity(500, MAX)).toBe(MAX)
  })

  it('altera, limita e remove quantidades', () => {
    let items = addItem([], pao, {}, 2, MAX)
    const key = items[0].key
    items = setQuantity(items, key, 5, MAX)
    expect(items[0].quantity).toBe(5)
    items = setQuantity(items, key, NaN, MAX)
    expect(items[0].quantity).toBe(5)
    items = setQuantity(items, key, 1000, MAX)
    expect(items[0].quantity).toBe(MAX)
    items = setQuantity(items, key, 0, MAX)
    expect(items).toHaveLength(0)
    items = addItem([], pao, {}, 1, MAX)
    expect(removeItem(items, items[0].key)).toHaveLength(0)
  })

  it('restaura o carrinho salvo', () => {
    const items = addItem(addItem([], pao, {}, 2, MAX), massa, { formato: 'curto' }, 1, MAX)
    const restored = parseStoredCart(serializeCart(items))
    expect(restored.corrupted).toBe(false)
    expect(restored.items).toEqual(items)
  })

  it('lida com dados locais inválidos', () => {
    expect(parseStoredCart('{not json')).toEqual({ items: [], corrupted: true })
    expect(parseStoredCart('"texto"')).toEqual({ items: [], corrupted: true })
    const partial = parseStoredCart(
      JSON.stringify({ items: [{ productId: 'pao', selections: {}, quantity: 2 }, { productId: 'x', quantity: -1 }, null] }),
    )
    expect(partial.items).toHaveLength(1)
    expect(partial.corrupted).toBe(true)
  })

  it('reconcilia com o catálogo atual e avisa mudanças', () => {
    const stored: CartItem[] = [
      { key: lineKey('sumiu', {}), productId: 'sumiu', selections: {}, quantity: 1, nameSnapshot: 'Pão antigo' },
      { key: lineKey('massa', { formato: 'fino' }), productId: 'massa', selections: { formato: 'fino' }, quantity: 1, nameSnapshot: 'Massa fresca' },
      { key: lineKey('pao', {}), productId: 'pao', selections: {}, quantity: 500, nameSnapshot: 'Pão' },
      { key: lineKey('recheada', {}), productId: 'recheada', selections: {}, quantity: 1, nameSnapshot: 'Massa recheada' },
    ]
    const catalogNow = [massa, { ...recheada, availability: 'unavailable' as const }, pao]
    const { items, notices } = reconcileCart(stored, catalogNow, MAX)
    expect(items.map((i) => i.productId)).toEqual(['pao'])
    expect(items[0].quantity).toBe(MAX)
    expect(notices).toHaveLength(4)
    expect(notices[0]).toContain('Pão antigo')
  })

  it('recalcula preços pelo catálogo, não pelo armazenamento', () => {
    const items = addItem([], pao, {}, 2, MAX)
    const lines = buildLines(items, [{ ...pao, priceInCents: 1500 }])
    expect(lines[0].lineTotalInCents).toBe(3000)
  })

  it('não trata preço ausente como zero', () => {
    let items = addItem([], pao, {}, 3, MAX)
    items = addItem(items, recheada, {}, 1, MAX)
    const summary = summarize(buildLines(items, products))
    expect(summary.allPriced).toBe(false)
    expect(summary.hasUnpriced).toBe(true)
    expect(summary.pricedSubtotalInCents).toBe(3750)
  })

  it('soma em centavos sem erro de ponto flutuante', () => {
    const p = { ...pao, priceInCents: 10 }
    const lines = buildLines(addItem([], p, {}, 3, MAX), [p])
    expect(summarize(lines).pricedSubtotalInCents).toBe(30)
    expect(parseBRLToCents('0,10')).toBe(10)
    expect(parseBRLToCents('1.234,56')).toBe(123456)
    expect(parseBRLToCents('12.5')).toBe(1250)
    expect(parseBRLToCents('abc')).toBeNull()
  })
})

describe('mensagem do WhatsApp', () => {
  it('monta a mensagem com acentos, quebras e observações', () => {
    let items = addItem([], massa, { formato: 'longo' }, 2, MAX)
    items = addItem(items, recheada, {}, 1, MAX)
    const lines = buildLines(items, products)
    const text = buildSelectionMessage(lines, summarize(lines), {
      name: 'João Antônio',
      date: '2026-11-05',
      notes: 'Sem pressa.\nPode ser à tarde?',
    })
    expect(text).toContain('1. Massa fresca\nVariação: Formato longo\nQuantidade: 2 × pacote')
    expect(text).toContain('Subtotal: R$ 36,00')
    expect(text).toContain('2. Massa recheada')
    expect(text).toContain('Preço: sob consulta')
    expect(text).toContain('Subtotal dos itens com preço')
    expect(text).toContain('Nome: João Antônio')
    expect(text).toContain('Data desejada: 05/11/2026')
    expect(text).toContain('Pode ser à tarde?')
    expect(text.endsWith('Podem confirmar a disponibilidade e o valor final?')).toBe(true)
    const plan = planWhatsApp('5511999999999', text, 3000)
    expect(plan.status).toBe('direct')
    if (plan.status === 'direct') expect(decodeURIComponent(plan.url.split('?text=')[1])).toBe(text)
  })

  it('usa "Subtotal dos produtos" quando tudo tem preço', () => {
    const lines = buildLines(addItem([], pao, {}, 2, MAX), products)
    expect(buildSelectionMessage(lines, summarize(lines))).toContain('Subtotal dos produtos: R$ 25,00')
  })

  it('sem número configurado, indica canal indisponível', () => {
    expect(planWhatsApp('', 'oi', 3000).status).toBe('unconfigured')
  })

  it('mensagem extensa não é truncada: abre com introdução curta', () => {
    const plan = planWhatsApp('5511999999999', 'x'.repeat(5000), 3000)
    expect(plan.status).toBe('too_long')
  })

  it('coffee break não exige itens', () => {
    const text = buildCoffeeBreakMessage({ eventType: 'Reunião', people: '30' })
    expect(text).toContain('Tipo de evento: Reunião')
    expect(text).toContain('Número de pessoas: 30')
  })
})

describe('catálogo', () => {
  it('descarta registros inválidos e IDs duplicados', () => {
    const c = parseCatalog({
      categories: [{ id: 'a', name: 'A' }, { name: 'sem id' }],
      products: [
        { id: 'p', name: 'P', categoryId: 'a', priceInCents: 12.5 },
        { id: 'p', name: 'Duplicado', categoryId: 'a' },
        { id: 'q', categoryId: 'a' },
      ],
    })
    expect(c?.categories).toHaveLength(1)
    expect(c?.products).toHaveLength(1)
    expect(c?.products[0].priceInCents).toBeUndefined()
    expect(parseCatalog('lixo')).toBeNull()
  })
})
