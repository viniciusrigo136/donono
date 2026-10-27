import { Download, FileUp, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { parseCatalog } from '../catalog/validate'
import { company, settings } from '../config/company'
import { useCatalog } from '../state/CatalogContext'
import { Feedback } from './Feedback'

export function PublishTab() {
  const { catalog, hasDraft, updateCatalog, resetToPublished } = useCatalog()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const exportCatalog = () => {
    const blob = new Blob([JSON.stringify(catalog, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'catalog.json'
    a.click()
    URL.revokeObjectURL(url)
    setFeedback({ ok: true, text: 'Arquivo catalog.json gerado.' })
  }

  const importCatalog = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = parseCatalog(JSON.parse(await file.text()))
      if (!parsed) throw new Error('formato')
      if (!window.confirm(`Substituir o catálogo atual por ${parsed.products.length} produtos e ${parsed.categories.length} categorias do arquivo?`)) return
      const ok = updateCatalog(parsed)
      setFeedback(ok ? { ok, text: 'Catálogo importado.' } : { ok, text: 'Não foi possível salvar neste navegador.' })
    } catch {
      setFeedback({ ok: false, text: 'Arquivo inválido. Use um catalog.json exportado por este painel.' })
    }
  }

  const rows: [string, string][] = [
    ['WhatsApp', company.whatsappNumber ? `+${company.whatsappNumber}` : 'Não configurado — o site oferece “Copiar seleção”'],
    ['Modo de demonstração', settings.demoMode ? 'Ativo (itens de exemplo visíveis, site não indexado)' : 'Desativado'],
    ['Instagram', company.instagramHandle],
    ['Telefone / endereço / horários', [company.phoneDisplay, company.address, company.openingHours].some(Boolean) ? 'Configurados' : 'Não informados (ocultos no site)'],
  ]

  return (
    <section aria-labelledby="titulo-publicar" className="max-w-3xl">
      <h1 id="titulo-publicar" className="text-3xl font-semibold">
        Publicar alterações
      </h1>

      <div className={`mt-6 rounded-2xl p-5 ${hasDraft ? 'bg-dourado/15' : 'bg-white'}`}>
        <p className="font-semibold">{hasDraft ? 'Há alterações salvas apenas neste navegador.' : 'Nenhuma alteração pendente.'}</p>
        <p className="mt-1 text-sm leading-relaxed text-marrom-suave">
          {hasDraft
            ? 'Você já vê as mudanças no site neste aparelho. Para que todos os visitantes vejam, exporte o arquivo e envie para quem publica o site.'
            : 'O site está exibindo o catálogo publicado.'}
        </p>
      </div>

      <div className="mt-6">
        <Feedback feedback={feedback} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={exportCatalog}>
          <Download aria-hidden size={18} /> Exportar catalog.json
        </button>
        <label className="btn-secondary cursor-pointer has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-dourado">
          <FileUp aria-hidden size={18} /> Importar arquivo
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              importCatalog(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
        {hasDraft && (
          <button
            type="button"
            className="btn-ghost text-terracota-texto"
            onClick={() => {
              if (window.confirm('Descartar todas as alterações deste navegador e voltar ao catálogo publicado?')) {
                resetToPublished()
                setFeedback({ ok: true, text: 'Alterações descartadas.' })
              }
            }}
          >
            <RotateCcw aria-hidden size={17} /> Descartar alterações
          </button>
        )}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Como publicar</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-marrom">
        <li>Clique em “Exportar catalog.json”.</li>
        <li>
          Substitua o arquivo <code className="font-mono">src/data/catalog.json</code> do projeto pelo arquivo exportado.
        </li>
        <li>Gere uma nova versão do site (build) e publique.</li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold">Configuração atual</h2>
      <dl className="mt-3 divide-y divide-marrom/10 rounded-2xl bg-white text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[14rem_1fr]">
            <dt className="font-semibold">{k}</dt>
            <dd className="text-marrom-suave">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-marrom-suave">
        Esses dados ficam em <code className="font-mono">src/config/company.ts</code> e no arquivo <code className="font-mono">.env</code>.
      </p>
    </section>
  )
}
