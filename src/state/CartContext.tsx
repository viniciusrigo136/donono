import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  addItem as addToItems,
  buildLines,
  CART_STORAGE_KEY,
  parseStoredCart,
  reconcileCart,
  removeItem as removeFromItems,
  serializeCart,
  setQuantity as setItemQuantity,
  summarize,
  type CartItem,
  type CartLine,
  type CartSummary,
} from '../cart/cart'
import type { Product, Selections } from '../catalog/types'
import { settings } from '../config/company'
import { readStorage, writeStorage } from '../lib/storage'
import { useCatalog } from './CatalogContext'

interface CartContextValue {
  lines: CartLine[]
  summary: CartSummary
  notices: string[]
  dismissNotices: () => void
  /** Última mudança, lida por leitores de tela e exibida no aviso flutuante. */
  status: { id: number; text: string } | null
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  add: (product: Product, selections: Selections, quantity: number) => boolean
  setQuantity: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const MAX = settings.maxQuantityPerItem

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog()

  const [initial] = useState(() => {
    const stored = parseStoredCart(readStorage(CART_STORAGE_KEY))
    const reconciled = reconcileCart(stored.items, products, MAX)
    const notices = stored.corrupted
      ? ['Não foi possível recuperar parte da seleção salva neste aparelho.', ...reconciled.notices]
      : reconciled.notices
    return { items: reconciled.items, notices }
  })
  const [rawItems, setRawItems] = useState<CartItem[]>(initial.items)
  const [notices, setNotices] = useState(initial.notices)
  const [status, setStatus] = useState<CartContextValue['status']>(null)
  const [isOpen, setOpen] = useState(false)

  // Se o catálogo mudar com a página aberta, itens inválidos deixam de contar.
  const items = useMemo(() => reconcileCart(rawItems, products, MAX).items, [rawItems, products])
  const lines = useMemo(() => buildLines(items, products), [items, products])
  const summary = useMemo(() => summarize(lines), [lines])

  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, serializeCart(items))
  }, [items])

  const announce = useCallback((text: string) => setStatus((s) => ({ id: (s?.id ?? 0) + 1, text })), [])

  const add = useCallback(
    (product: Product, selections: Selections, quantity: number) => {
      const next = addToItems(items, product, selections, quantity, MAX)
      if (next === items) return false
      setRawItems(next)
      announce(`${product.name} adicionado à seleção.`)
      return true
    },
    [items, announce],
  )

  const setQuantity = useCallback(
    (key: string, quantity: number) => {
      const line = lines.find((l) => l.key === key)
      const next = setItemQuantity(items, key, quantity, MAX)
      setRawItems(next)
      if (line) {
        announce(
          next.some((i) => i.key === key)
            ? `${line.product.name}: quantidade ${Math.min(quantity, MAX)}.`
            : `${line.product.name} removido da seleção.`,
        )
      }
    },
    [items, lines, announce],
  )

  const remove = useCallback(
    (key: string) => {
      const line = lines.find((l) => l.key === key)
      setRawItems(removeFromItems(items, key))
      if (line) announce(`${line.product.name} removido da seleção.`)
    },
    [items, lines, announce],
  )

  const clear = useCallback(() => {
    setRawItems([])
    announce('Seleção esvaziada.')
  }, [announce])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      summary,
      notices,
      dismissNotices: () => setNotices([]),
      status,
      isOpen,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, summary, notices, status, isOpen, add, setQuantity, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}
