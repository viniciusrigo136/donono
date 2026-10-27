import seed from '../data/catalog.json'
import { settings } from '../config/company'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'
import type { Catalog, Category, Product } from './types'
import { parseCatalog } from './validate'

/**
 * Fonte do catálogo.
 * - Publicado: src/data/catalog.json (vale para todos os visitantes após o build).
 * - Rascunho do painel: localStorage deste navegador, até ser exportado e publicado.
 */
const DRAFT_KEY = 'donono:catalog-draft:v1'

export const publishedCatalog: Catalog = parseCatalog(seed) ?? {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  categories: [],
  products: [],
}

export function loadDraft(): Catalog | null {
  const raw = readStorage(DRAFT_KEY)
  if (!raw) return null
  try {
    return parseCatalog(JSON.parse(raw))
  } catch {
    return null
  }
}

export const saveDraft = (catalog: Catalog) => writeStorage(DRAFT_KEY, JSON.stringify(catalog))
export const discardDraft = () => removeStorage(DRAFT_KEY)

/** Catálogo efetivo: rascunho local do painel (se houver) ou o publicado. */
export const loadCatalog = (): Catalog => loadDraft() ?? publishedCatalog

/** Produtos visíveis no site público. */
export const visibleProducts = (catalog: Catalog, demoMode = settings.demoMode): Product[] => {
  const activeCategories = new Set(catalog.categories.filter((c) => c.active).map((c) => c.id))
  return catalog.products.filter(
    (p) => p.active && activeCategories.has(p.categoryId) && (demoMode || !p.isDemo),
  )
}

/** Só categorias ativas e com pelo menos um produto visível. */
export const visibleCategories = (catalog: Catalog, products: Product[]): Category[] =>
  catalog.categories
    .filter((c) => c.active && products.some((p) => p.categoryId === c.id))
    .sort((a, b) => a.order - b.order)
