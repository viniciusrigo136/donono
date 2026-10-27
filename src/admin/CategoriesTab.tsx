import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Category } from '../catalog/types'
import { newId, slugify } from '../lib/slug'
import { Feedback } from './Feedback'
import { useSave } from './useSave'

export function CategoriesTab() {
  const { catalog, save, feedback } = useSave()
  const [newName, setNewName] = useState('')
  const sorted = [...catalog.categories].sort((a, b) => a.order - b.order)
  const countOf = (id: string) => catalog.products.filter((p) => p.categoryId === id).length

  const patch = (id: string, changes: Partial<Category>, text?: string) =>
    save((c) => ({ ...c, categories: c.categories.map((x) => (x.id === id ? { ...x, ...changes } : x)) }), text)

  const move = (index: number, dir: -1 | 1) => {
    const target = sorted[index + dir]
    if (!target) return
    const reordered = [...sorted]
    reordered[index + dir] = sorted[index]
    reordered[index] = target
    save((c) => ({ ...c, categories: reordered.map((x, i) => ({ ...x, order: i + 1 })) }), 'Ordem atualizada.')
  }

  const add = (e: FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const base = slugify(name) || newId('cat')
    const id = catalog.categories.some((c) => c.id === base) ? `${base}-${newId('').slice(1, 5)}` : base
    save((c) => ({ ...c, categories: [...c.categories, { id, name, order: sorted.length + 1, active: true }] }), `Categoria “${name}” criada.`)
    setNewName('')
  }

  return (
    <section aria-labelledby="titulo-categorias">
      <h1 id="titulo-categorias" className="text-3xl font-semibold">
        Categorias
      </h1>
      <p className="mt-1 text-sm text-marrom-suave">Categorias sem produtos visíveis não aparecem no site.</p>

      <form onSubmit={add} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="nova-categoria" className="sr-only">
          Nome da nova categoria
        </label>
        <input id="nova-categoria" className="field sm:max-w-sm" placeholder="Nova categoria" maxLength={40} value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="btn-primary" disabled={!newName.trim()}>
          <Plus aria-hidden size={18} /> Adicionar
        </button>
      </form>

      <div className="mt-6">
        <Feedback feedback={feedback} />
      </div>

      <ul className="divide-y divide-marrom/10 overflow-hidden rounded-2xl bg-white">
        {sorted.map((cat, i) => {
          const count = countOf(cat.id)
          return (
            <li key={cat.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex">
                <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-verde/5 disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Mover ${cat.name} para cima`}>
                  <ArrowUp aria-hidden size={17} />
                </button>
                <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-verde/5 disabled:opacity-30" disabled={i === sorted.length - 1} onClick={() => move(i, 1)} aria-label={`Mover ${cat.name} para baixo`}>
                  <ArrowDown aria-hidden size={17} />
                </button>
              </div>
              <CategoryName category={cat} onSave={(name) => patch(cat.id, { name }, 'Nome atualizado.')} />
              <span className="text-sm text-marrom-suave">{count === 1 ? '1 produto' : `${count} produtos`}</span>
              <label className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
                <input type="checkbox" className="size-5 accent-verde" checked={cat.active} onChange={(e) => patch(cat.id, { active: e.target.checked })} />
                No site
              </label>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-full text-marrom-suave hover:bg-terracota/10 hover:text-terracota-texto disabled:opacity-30"
                disabled={count > 0}
                title={count > 0 ? 'Mova ou exclua os produtos antes' : undefined}
                aria-label={count > 0 ? `Não é possível excluir ${cat.name}: há produtos nela` : `Excluir ${cat.name}`}
                onClick={() => {
                  if (window.confirm(`Excluir a categoria “${cat.name}”?`)) {
                    save((c) => ({ ...c, categories: c.categories.filter((x) => x.id !== cat.id) }), 'Categoria excluída.')
                  }
                }}
              >
                <Trash2 aria-hidden size={18} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function CategoryName({ category, onSave }: { category: Category; onSave: (name: string) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    const name = draft?.trim()
    if (name && name !== category.name) onSave(name)
    setDraft(null)
  }
  return (
    <>
      <label htmlFor={`cat-${category.id}`} className="sr-only">
        Nome da categoria
      </label>
      <input
        id={`cat-${category.id}`}
        className="field w-auto min-w-0 flex-1 py-2 font-semibold sm:max-w-xs"
        value={draft ?? category.name}
        maxLength={40}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
      />
    </>
  )
}
