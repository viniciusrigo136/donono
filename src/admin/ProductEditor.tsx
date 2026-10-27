import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import type { Availability, Product, VariantGroup } from '../catalog/types'
import { Dialog } from '../components/Dialog'
import { ProductImage } from '../components/ProductImage'
import { centsToInput, parseBRLToCents } from '../lib/money'
import { newId, slugify } from '../lib/slug'
import { useCatalog } from '../state/CatalogContext'
import { AVAILABILITY_LABEL } from './labels'

interface OptionForm {
  id: string
  name: string
  price: string
  active: boolean
}
interface GroupForm {
  id: string
  name: string
  required: boolean
  options: OptionForm[]
}
interface FormState {
  name: string
  slug: string
  slugTouched: boolean
  categoryId: string
  description: string
  sellingUnit: string
  price: string
  availability: Availability
  active: boolean
  featured: boolean
  isDemo: boolean
  image: string
  imageAlt: string
  variants: GroupForm[]
}

const toForm = (p: Product | null, defaultCategory: string): FormState => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  slugTouched: Boolean(p),
  categoryId: p?.categoryId ?? defaultCategory,
  description: p?.description ?? '',
  sellingUnit: p?.sellingUnit ?? '',
  price: centsToInput(p?.priceInCents),
  availability: p?.availability ?? 'available',
  active: p?.active ?? true,
  featured: p?.featured ?? false,
  isDemo: p?.isDemo ?? false,
  image: p?.image ?? '',
  imageAlt: p?.imageAlt ?? '',
  variants: (p?.variants ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    required: g.required,
    options: g.options.map((o) => ({ id: o.id, name: o.name, price: centsToInput(o.priceInCents), active: o.active })),
  })),
})

/** Reduz a foto enviada para no máximo 1200 px e converte para WebP. */
async function resizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.82)
}

interface Props {
  product: Product | 'new' | null
  onClose: () => void
  onSave: (product: Product, isNew: boolean) => boolean
}

export function ProductEditor({ product, onClose, onSave }: Props) {
  const title = product === 'new' ? 'Novo produto' : product ? `Editar ${product.name}` : 'Produto'
  return (
    <Dialog open={product !== null} onClose={onClose} title={title} className="max-w-3xl">
      {product !== null && (
        <EditorForm key={product === 'new' ? 'new' : product.id} product={product === 'new' ? null : product} onCancel={onClose} onSave={onSave} />
      )}
    </Dialog>
  )
}

function EditorForm({ product, onCancel, onSave }: { product: Product | null; onCancel: () => void; onSave: Props['onSave'] }) {
  const { catalog } = useCatalog()
  const [form, setForm] = useState(() => toForm(product, catalog.categories[0]?.id ?? ''))
  const [errors, setErrors] = useState<string[]>([])
  const [imageNote, setImageNote] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const setGroup = (gi: number, changes: Partial<GroupForm>) =>
    setForm((f) => ({ ...f, variants: f.variants.map((g, i) => (i === gi ? { ...g, ...changes } : g)) }))
  const setOption = (gi: number, oi: number, changes: Partial<OptionForm>) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((g, i) => (i === gi ? { ...g, options: g.options.map((o, j) => (j === oi ? { ...o, ...changes } : o)) } : g)),
    }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const problems: string[] = []
    const name = form.name.trim()
    const slug = slugify(form.slug || form.name)
    if (!name) problems.push('Informe o nome do produto.')
    if (!catalog.categories.some((c) => c.id === form.categoryId)) problems.push('Escolha uma categoria.')
    if (slug && catalog.products.some((p) => p.slug === slug && p.id !== product?.id)) problems.push('Já existe um produto com este endereço (slug).')
    const price = form.price.trim() ? parseBRLToCents(form.price) : undefined
    if (price === null) problems.push('Preço inválido. Use o formato 12,50 ou deixe vazio para “sob consulta”.')

    const variants: VariantGroup[] = []
    form.variants.forEach((g, gi) => {
      const options = g.options.filter((o) => o.name.trim())
      if (!g.name.trim() || !options.length) {
        problems.push(`Variação ${gi + 1}: informe o nome e pelo menos uma opção.`)
        return
      }
      const parsed = options.map((o) => {
        const p = o.price.trim() ? parseBRLToCents(o.price) : undefined
        if (p === null) problems.push(`Preço inválido na opção “${o.name}”.`)
        return { id: o.id, name: o.name.trim(), priceInCents: p ?? undefined, active: o.active }
      })
      variants.push({ id: g.id, name: g.name.trim(), required: g.required, options: parsed })
    })
    if (variants.filter((g) => g.options.some((o) => o.priceInCents !== undefined)).length > 1) {
      problems.push('Apenas um grupo de variações pode ter preço próprio.')
    }

    setErrors(problems)
    if (problems.length) return

    const result: Product = {
      id: product?.id ?? newId('prod'),
      slug,
      name,
      categoryId: form.categoryId,
      description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      imageAlt: form.imageAlt.trim() || undefined,
      sellingUnit: form.sellingUnit.trim() || undefined,
      priceInCents: price ?? undefined,
      variants: variants.length ? variants : undefined,
      featured: form.featured,
      active: form.active,
      availability: form.availability,
      isDemo: form.isDemo || undefined,
    }
    if (onSave(result, !product)) onCancel()
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const dataUrl = await resizeImage(file)
      set('image', dataUrl)
      const kb = Math.round((dataUrl.length * 3) / 4 / 1024)
      setImageNote(
        kb > 400
          ? `Imagem otimizada (${kb} KB). Para muitas fotos, prefira salvar os arquivos em public/produtos e informar o caminho.`
          : `Imagem otimizada (${kb} KB).`,
      )
    } catch {
      setImageNote('Não foi possível ler esta imagem. Tente um arquivo JPG, PNG ou WebP.')
    }
  }

  const preview: Product = { id: 'preview', slug: '', name: form.name, categoryId: form.categoryId, image: form.image || undefined, featured: false, active: true, availability: 'available' }

  return (
    <form onSubmit={submit} noValidate className="space-y-6 px-5 pb-6">
      {errors.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl bg-terracota/10 p-4 text-sm font-semibold text-terracota-texto">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="p-nome" className="label">Nome *</label>
          <input
            id="p-nome"
            className="field"
            required
            maxLength={90}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) }))}
          />
        </div>
        <div>
          <label htmlFor="p-categoria" className="label">Categoria *</label>
          <select id="p-categoria" className="field" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            {catalog.categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-unidade" className="label">Unidade de venda</label>
          <input id="p-unidade" className="field" placeholder="Ex.: pacote, unidade, bandeja" maxLength={40} value={form.sellingUnit} onChange={(e) => set('sellingUnit', e.target.value)} />
        </div>
        <div>
          <label htmlFor="p-preco" className="label">Preço (R$)</label>
          <input id="p-preco" inputMode="decimal" className="field" placeholder="Vazio = sob consulta" value={form.price} onChange={(e) => set('price', e.target.value)} aria-describedby="p-preco-ajuda" />
          <p id="p-preco-ajuda" className="mt-1 text-xs text-marrom-suave">Opções com preço próprio substituem este valor.</p>
        </div>
        <div>
          <label htmlFor="p-disp" className="label">Disponibilidade</label>
          <select id="p-disp" className="field" value={form.availability} onChange={(e) => set('availability', e.target.value as Availability)}>
            {Object.entries(AVAILABILITY_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-desc" className="label">Descrição curta</label>
          <textarea id="p-desc" rows={3} maxLength={400} className="field" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <p className="mt-1 text-xs text-marrom-suave">Informe apenas o que foi confirmado (ingredientes, peso, alergênicos).</p>
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
        <legend className="label">Exibição</legend>
        {(
          [
            ['active', 'Mostrar no site'],
            ['featured', 'Destaque'],
            ['isDemo', 'Item de exemplo (oculto fora do modo demonstração)'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" className="size-5 accent-verde" checked={form[key]} onChange={(e) => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="label">Foto</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ProductImage product={preview} className="aspect-[4/3] w-full shrink-0 rounded-xl sm:w-44" />
          <div className="flex-1 space-y-3">
            <label className="btn-secondary cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dourado">
              <ImagePlus aria-hidden size={17} /> Enviar foto
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {form.image && (
              <button type="button" className="btn-ghost ml-2" onClick={() => { set('image', ''); setImageNote(null) }}>
                <X aria-hidden size={16} /> Remover foto
              </button>
            )}
            {imageNote && <p className="text-xs text-marrom-suave" aria-live="polite">{imageNote}</p>}
            <div>
              <label htmlFor="p-img" className="label text-xs">Ou caminho/URL da imagem</label>
              <input
                id="p-img"
                className="field text-sm"
                placeholder="/produtos/nome-da-foto.webp"
                value={form.image.startsWith('data:') ? '(foto enviada)' : form.image}
                readOnly={form.image.startsWith('data:')}
                onChange={(e) => set('image', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="p-alt" className="label text-xs">Descrição da foto (acessibilidade)</label>
              <input id="p-alt" className="field text-sm" maxLength={140} placeholder={form.name || 'O que aparece na foto'} value={form.imageAlt} onChange={(e) => set('imageAlt', e.target.value)} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Variações</legend>
        <p className="-mt-1 mb-3 text-xs text-marrom-suave">Ex.: formato, tamanho. Opções com preço substituem o preço base.</p>
        <div className="space-y-4">
          {form.variants.map((g, gi) => (
            <div key={g.id} className="rounded-xl border border-marrom/15 bg-white p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-40 flex-1">
                  <label htmlFor={`g-${g.id}`} className="label text-xs">Nome da variação</label>
                  <input id={`g-${g.id}`} className="field" placeholder="Ex.: Tamanho" value={g.name} onChange={(e) => setGroup(gi, { name: e.target.value })} />
                </div>
                <label className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" className="size-5 accent-verde" checked={g.required} onChange={(e) => setGroup(gi, { required: e.target.checked })} />
                  Obrigatória
                </label>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full text-marrom-suave hover:bg-terracota/10 hover:text-terracota-texto"
                  aria-label={`Remover variação ${g.name || gi + 1}`}
                  onClick={() => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== gi) }))}
                >
                  <Trash2 aria-hidden size={18} />
                </button>
              </div>
              <ul className="mt-3 space-y-2">
                {g.options.map((o, oi) => (
                  <li key={o.id} className="grid grid-cols-[1fr_6.5rem_auto_auto] items-center gap-2">
                    <input aria-label={`Nome da opção ${oi + 1}`} className="field py-2 text-sm" placeholder="Opção" value={o.name} onChange={(e) => setOption(gi, oi, { name: e.target.value })} />
                    <input aria-label={`Preço da opção ${o.name || oi + 1}`} inputMode="decimal" className="field py-2 text-sm" placeholder="R$ (opc.)" value={o.price} onChange={(e) => setOption(gi, oi, { price: e.target.value })} />
                    <label className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold" title="Opção disponível">
                      <input type="checkbox" className="size-5 accent-verde" checked={o.active} onChange={(e) => setOption(gi, oi, { active: e.target.checked })} />
                      <span className="hidden sm:inline">Ativa</span>
                      <span className="sr-only sm:hidden">Ativa</span>
                    </label>
                    <button
                      type="button"
                      className="grid size-10 place-items-center rounded-full text-marrom-suave hover:text-terracota-texto"
                      aria-label={`Remover opção ${o.name || oi + 1}`}
                      onClick={() => setGroup(gi, { options: g.options.filter((_, j) => j !== oi) })}
                    >
                      <X aria-hidden size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-ghost mt-2 -ml-3 px-3 text-sm"
                onClick={() => setGroup(gi, { options: [...g.options, { id: newId('opc'), name: '', price: '', active: true }] })}
              >
                <Plus aria-hidden size={16} /> Adicionar opção
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary mt-3"
          onClick={() =>
            setForm((f) => ({ ...f, variants: [...f.variants, { id: newId('var'), name: '', required: true, options: [{ id: newId('opc'), name: '', price: '', active: true }] }] }))
          }
        >
          <Plus aria-hidden size={16} /> Adicionar variação
        </button>
      </fieldset>

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold text-marrom-suave">Avançado</summary>
        <div className="mt-3">
          <label htmlFor="p-slug" className="label text-xs">Identificador no endereço (slug)</label>
          <input id="p-slug" className="field text-sm" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} />
        </div>
      </details>

      <div className="sticky bottom-0 -mx-5 flex justify-end gap-3 border-t border-marrom/10 bg-creme px-5 pt-4">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary px-6">{product ? 'Salvar alterações' : 'Cadastrar produto'}</button>
      </div>
    </form>
  )
}
