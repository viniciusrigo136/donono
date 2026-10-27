import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Availability, Product } from '../catalog/types'
import { ProductImage } from '../components/ProductImage'
import { centsToInput, parseBRLToCents } from '../lib/money'
import { normalizeSearch } from '../lib/slug'
import { Feedback } from './Feedback'
import { AVAILABILITY_LABEL } from './labels'
import { ProductEditor } from './ProductEditor'
import { useSave } from './useSave'

export function ProductsTab() {
  const { catalog, save, feedback } = useSave()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  const categoryName = useMemo(() => new Map(catalog.categories.map((c) => [c.id, c.name])), [catalog.categories])
  const list = catalog.products.filter(
    (p) => (!categoryId || p.categoryId === categoryId) && (!query.trim() || normalizeSearch(p.name).includes(normalizeSearch(query))),
  )

  const patch = (id: string, changes: Partial<Product>, text?: string) =>
    save((c) => ({ ...c, products: c.products.map((p) => (p.id === id ? { ...p, ...changes } : p)) }), text)

  const remove = (p: Product) => {
    if (!window.confirm(`Excluir “${p.name}”? Para apenas esconder do site, desmarque “No site”.`)) return
    save((c) => ({ ...c, products: c.products.filter((x) => x.id !== p.id) }), `“${p.name}” excluído.`)
  }

  return (
    <section aria-labelledby="titulo-produtos">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="titulo-produtos" className="text-3xl font-semibold">
            Produtos
          </h1>
          <p className="mt-1 text-sm text-marrom-suave">
            {catalog.products.length} cadastrados · {catalog.products.filter((p) => p.active).length} no site
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')} disabled={!catalog.categories.length}>
          <Plus aria-hidden size={18} /> Novo produto
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-busca" className="sr-only">
            Buscar produto
          </label>
          <Search aria-hidden size={17} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-marrom/50" />
          <input id="admin-busca" type="search" className="field pl-10" placeholder="Buscar pelo nome" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="sr-only" htmlFor="admin-categoria">
          Filtrar por categoria
        </label>
        <select id="admin-categoria" className="field sm:w-56" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas as categorias</option>
          {catalog.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <Feedback feedback={feedback} />
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-marrom/25 p-10 text-center text-marrom-suave">Nenhum produto encontrado.</p>
      ) : (
        <ul className="divide-y divide-marrom/10 overflow-hidden rounded-2xl bg-white">
          {list.map((p) => (
            <li key={p.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <ProductImage product={p} className="size-16 shrink-0 rounded-xl [&_span]:hidden [&_svg]:size-6" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-marrom">
                    <span className="truncate">{p.name}</span>
                    {p.featured && <Star aria-label="Destaque" size={15} className="fill-dourado text-dourado" />}
                    {p.isDemo && <span className="rounded-full bg-terracota/10 px-2 py-0.5 text-xs text-terracota-texto">Exemplo</span>}
                    {!p.active && <span className="rounded-full bg-marrom/10 px-2 py-0.5 text-xs">Oculto</span>}
                  </p>
                  <p className="text-sm text-marrom-suave">
                    {categoryName.get(p.categoryId) ?? 'Sem categoria'}
                    {p.sellingUnit && ` · por ${p.sellingUnit}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {p.variants?.length ? (
                  <button type="button" className="min-h-11 w-32 text-left text-sm text-marrom-suave underline underline-offset-4" onClick={() => setEditing(p)}>
                    Preço por opção
                  </button>
                ) : (
                  <InlinePrice product={p} onSave={(cents) => patch(p.id, { priceInCents: cents }, `Preço de “${p.name}” atualizado.`)} />
                )}
                <label className="sr-only" htmlFor={`disp-${p.id}`}>
                  Disponibilidade de {p.name}
                </label>
                <select
                  id={`disp-${p.id}`}
                  className="field w-auto py-2 text-sm"
                  value={p.availability}
                  onChange={(e) => patch(p.id, { availability: e.target.value as Availability })}
                >
                  {Object.entries(AVAILABILITY_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" className="size-5 accent-verde" checked={p.active} onChange={(e) => patch(p.id, { active: e.target.checked })} />
                  No site
                </label>
                <button type="button" className="btn-secondary px-4" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}>
                  <Pencil aria-hidden size={16} /> Editar
                </button>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full text-marrom-suave hover:bg-terracota/10 hover:text-terracota-texto"
                  onClick={() => remove(p)}
                  aria-label={`Excluir ${p.name}`}
                >
                  <Trash2 aria-hidden size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProductEditor
        product={editing}
        onClose={() => setEditing(null)}
        onSave={(product, isNew) =>
          save(
            (c) => ({ ...c, products: isNew ? [...c.products, product] : c.products.map((p) => (p.id === product.id ? product : p)) }),
            isNew ? `“${product.name}” cadastrado.` : `“${product.name}” atualizado.`,
          )
        }
      />
    </section>
  )
}

function InlinePrice({ product, onSave }: { product: Product; onSave: (cents: number | undefined) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  const value = draft ?? centsToInput(product.priceInCents)

  const commit = () => {
    if (draft === null) return
    if (draft.trim() === '') {
      if (product.priceInCents !== undefined) onSave(undefined)
    } else {
      const cents = parseBRLToCents(draft)
      if (cents === null) {
        setInvalid(true)
        return
      }
      if (cents !== product.priceInCents) onSave(cents)
    }
    setDraft(null)
    setInvalid(false)
  }

  return (
    <div className="relative w-32">
      <label htmlFor={`preco-${product.id}`} className="sr-only">
        Preço de {product.name} em reais (vazio = sob consulta)
      </label>
      <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-marrom-suave">
        R$
      </span>
      <input
        id={`preco-${product.id}`}
        inputMode="decimal"
        className={`field py-2 pl-9 text-sm ${invalid ? 'border-terracota' : ''}`}
        placeholder="consulta"
        value={value}
        aria-invalid={invalid}
        onChange={(e) => {
          setDraft(e.target.value)
          setInvalid(false)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(null)
            setInvalid(false)
          }
        }}
      />
    </div>
  )
}
