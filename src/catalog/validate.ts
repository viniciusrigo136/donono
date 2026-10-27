import type { Availability, Catalog, Category, Product, VariantGroup, VariantOption } from './types'

const AVAILABILITY: Availability[] = ['available', 'on_request', 'unavailable']

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const cents = (v: unknown) => (Number.isSafeInteger(v) && (v as number) >= 0 ? (v as number) : undefined)

function option(v: unknown): VariantOption | null {
  const id = isObj(v) ? str(v.id) : undefined
  const name = isObj(v) ? str(v.name) : undefined
  if (!isObj(v) || !id || !name) return null
  return { id, name, priceInCents: cents(v.priceInCents), active: v.active !== false }
}

function group(v: unknown): VariantGroup | null {
  if (!isObj(v) || !Array.isArray(v.options)) return null
  const id = str(v.id)
  const name = str(v.name)
  const options = v.options.map(option).filter((o): o is VariantOption => o !== null)
  if (!id || !name || !options.length) return null
  return { id, name, required: v.required !== false, options }
}

function category(v: unknown, index: number): Category | null {
  if (!isObj(v)) return null
  const id = str(v.id)
  const name = str(v.name)
  if (!id || !name) return null
  return {
    id,
    name,
    description: str(v.description),
    order: typeof v.order === 'number' && Number.isFinite(v.order) ? v.order : index,
    active: v.active !== false,
  }
}

function product(v: unknown): Product | null {
  if (!isObj(v)) return null
  const id = str(v.id)
  const name = str(v.name)
  const categoryId = str(v.categoryId)
  if (!id || !name || !categoryId) return null
  const variants = Array.isArray(v.variants)
    ? v.variants.map(group).filter((g): g is VariantGroup => g !== null)
    : []
  return {
    id,
    slug: str(v.slug) ?? id,
    name,
    categoryId,
    description: str(v.description),
    image: str(v.image),
    imageAlt: str(v.imageAlt),
    sellingUnit: str(v.sellingUnit),
    priceInCents: cents(v.priceInCents),
    variants: variants.length ? variants : undefined,
    featured: v.featured === true,
    active: v.active !== false,
    availability: AVAILABILITY.includes(v.availability as Availability)
      ? (v.availability as Availability)
      : 'on_request',
    isDemo: v.isDemo === true ? true : undefined,
  }
}

/** Valida dados vindos de JSON (arquivo, importação ou localStorage). */
export function parseCatalog(input: unknown): Catalog | null {
  if (!isObj(input) || !Array.isArray(input.categories) || !Array.isArray(input.products)) return null
  const categories = input.categories.map(category).filter((c): c is Category => c !== null)
  const seen = new Set<string>()
  const products = input.products
    .map(product)
    .filter((p): p is Product => p !== null)
    .filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  return {
    version: 1,
    updatedAt: str(input.updatedAt) ?? new Date().toISOString(),
    categories,
    products,
  }
}
