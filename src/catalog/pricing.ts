import type { Product, Selections } from './types'

/** Opções selecionadas, na ordem dos grupos do produto. */
export function selectedOptions(product: Product, selections: Selections) {
  return (product.variants ?? []).flatMap((group) => {
    const option = group.options.find((o) => o.id === selections[group.id])
    return option ? [{ group, option }] : []
  })
}

/** Preço unitário em centavos, ou null quando sob consulta. */
export function unitPriceInCents(product: Product, selections: Selections): number | null {
  const priced = selectedOptions(product, selections).find(({ option }) => option.priceInCents !== undefined)
  return priced?.option.priceInCents ?? product.priceInCents ?? null
}

/** Faixa de preços para o card ("a partir de"). Null quando nada tem preço. */
export function priceRange(product: Product): { min: number; max: number; partial: boolean } | null {
  const options = (product.variants ?? []).flatMap((g) => g.options).filter((o) => o.active)
  const optionPrices = options.flatMap((o) => (o.priceInCents !== undefined ? [o.priceInCents] : []))
  const base = product.priceInCents
  const prices = base !== undefined ? [...optionPrices, base] : optionPrices
  if (!prices.length) return null
  // Algumas opções sem preço e sem preço base: parte da seleção fica sob consulta.
  const partial = base === undefined && optionPrices.length < options.length
  return { min: Math.min(...prices), max: Math.max(...prices), partial }
}

/** Primeiro grupo obrigatório sem seleção válida, se houver. */
export function missingRequiredGroup(product: Product, selections: Selections) {
  return (product.variants ?? []).find(
    (g) => g.required && !g.options.some((o) => o.active && o.id === selections[g.id]),
  )
}

export const canOrder = (product: Product) => product.active && product.availability !== 'unavailable'
