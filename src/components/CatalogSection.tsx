import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Product } from '../catalog/types'
import { normalizeSearch } from '../lib/slug'
import { useCatalog } from '../state/CatalogContext'
import { ProductCard } from './ProductCard'
import { ProductDialog } from './ProductDialog'

export function CatalogSection() {
  const { products, categories } = useCatalog()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todos')
  const [selected, setSelected] = useState<Product | null>(null)

  // Categoria escolhida pode sumir se o catálogo mudar.
  const activeCategory = category === 'todos' || categories.some((c) => c.id === category) ? category : 'todos'
  const order = useMemo(() => new Map(categories.map((c, i) => [c.id, i])), [categories])

  const results = useMemo(() => {
    const q = normalizeSearch(query)
    return products
      .filter((p) => activeCategory === 'todos' || p.categoryId === activeCategory)
      .filter((p) => !q || normalizeSearch(p.name).includes(q))
      .sort(
        (a, b) =>
          (order.get(a.categoryId) ?? 99) - (order.get(b.categoryId) ?? 99) ||
          Number(b.featured) - Number(a.featured) ||
          Number(a.availability === 'unavailable') - Number(b.availability === 'unavailable'),
      )
  }, [products, activeCategory, query, order])

  const filtered = query.trim() !== '' || activeCategory !== 'todos'
  const clearFilters = () => {
    setQuery('')
    setCategory('todos')
  }
  const chips = [{ id: 'todos', name: 'Todos' }, ...categories]

  return (
    <section id="produtos" aria-labelledby="produtos-titulo" className="border-t border-marrom/10 bg-white/60 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 id="produtos-titulo" className="mt-3 text-4xl font-semibold sm:text-5xl">
              Produtos
            </h2>
          </div>
          <div className="relative w-full md:max-w-xs">
            <label htmlFor="busca" className="sr-only">
              Buscar produto pelo nome
            </label>
            <Search aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-marrom/50" />
            <input
              id="busca"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pelo nome"
              className="field rounded-full pl-10"
              autoComplete="off"
            />
          </div>
        </div>

        {chips.length > 2 && (
          <div role="group" aria-label="Filtrar por categoria" className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {chips.map((c) => {
              const active = c.id === activeCategory
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c.id)}
                  className={`min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors ${
                    active ? 'border-verde bg-verde text-white' : 'border-marrom/20 bg-white text-marrom hover:border-verde'
                  }`}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        )}

        <p className="mt-6 text-sm text-marrom-suave" aria-live="polite">
          {results.length === 1 ? '1 produto' : `${results.length} produtos`}
          {filtered && results.length > 0 && (
            <button type="button" onClick={clearFilters} className="ml-3 font-semibold text-verde underline underline-offset-4">
              Limpar filtros
            </button>
          )}
        </p>

        {results.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-marrom/25 px-6 py-14 text-center">
            <p className="font-serif text-2xl text-verde">Nenhum produto encontrado</p>
            <p className="mt-2 text-marrom-suave">
              {query.trim() ? <>Não encontramos resultados para “{query.trim()}”.</> : 'Não há produtos nesta categoria no momento.'}
            </p>
            {filtered && (
              <button type="button" onClick={clearFilters} className="btn-secondary mt-6">
                <X aria-hidden size={16} /> Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <ul className="mt-6 grid gap-x-6 gap-y-10 min-[560px]:grid-cols-2 lg:grid-cols-3">
            {results.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} onOpen={() => setSelected(p)} priority={i < 2} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
