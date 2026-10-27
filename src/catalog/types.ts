export type Availability = 'available' | 'on_request' | 'unavailable'

export interface Category {
  id: string
  name: string
  description?: string
  order: number
  active: boolean
}

export interface VariantOption {
  id: string
  name: string
  /** Preço unitário completo desta opção, em centavos. Substitui o preço base. */
  priceInCents?: number
  active: boolean
}

export interface VariantGroup {
  id: string
  name: string
  required: boolean
  options: VariantOption[]
}

export interface Product {
  id: string
  slug: string
  name: string
  categoryId: string
  description?: string
  image?: string
  imageAlt?: string
  /** Unidade de venda confirmada (ex.: "pacote", "bandeja"). */
  sellingUnit?: string
  priceInCents?: number
  variants?: VariantGroup[]
  featured: boolean
  active: boolean
  availability: Availability
  /** Item usado só para demonstrar o site. Oculto quando o modo demo está desligado. */
  isDemo?: boolean
}

export interface Catalog {
  version: 1
  updatedAt: string
  categories: Category[]
  products: Product[]
}

export type Selections = Record<string, string>
