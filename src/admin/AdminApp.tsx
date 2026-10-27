import { ExternalLink, FolderTree, LogOut, Package, Upload } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { settings } from '../config/company'
import { Logo } from '../components/Logo'
import { useCatalog } from '../state/CatalogContext'
import { CategoriesTab } from './CategoriesTab'
import { ProductsTab } from './ProductsTab'
import { PublishTab } from './PublishTab'

const SESSION_KEY = 'donono:admin-session'

const readSession = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(readSession)
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />
  return (
    <Panel
      onLogout={() => {
        try {
          window.sessionStorage.removeItem(SESSION_KEY)
        } catch {
          /* indisponível */
        }
        setAuthed(false)
      }}
    />
  )
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pin === settings.adminPin) {
      try {
        window.sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* sessão só em memória */
      }
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center">
        <Logo size={140} className="mx-auto" priority />
        <h1 className="mt-6 text-2xl font-semibold">Painel Do Nono</h1>
        {!settings.adminPin ? (
          <p className="mt-4 text-sm leading-relaxed text-marrom-suave">
            O painel está desativado. Defina <code className="font-mono">VITE_ADMIN_PIN</code> no arquivo <code className="font-mono">.env</code> e reinicie o
            site.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <div>
              <label htmlFor="admin-pin" className="label">
                Código de acesso
              </label>
              <input
                id="admin-pin"
                type="password"
                autoComplete="current-password"
                className="field"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setError(false)
                }}
                aria-invalid={error}
                aria-describedby={error ? 'admin-pin-erro' : undefined}
                autoFocus
              />
              {error && (
                <p id="admin-pin-erro" role="alert" className="mt-2 text-sm font-semibold text-terracota-texto">
                  Código incorreto.
                </p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
          </form>
        )}
        <a href="#inicio" className="mt-6 inline-block text-sm font-semibold text-verde underline underline-offset-4">
          Voltar ao site
        </a>
      </div>
    </main>
  )
}

type Tab = 'produtos' | 'categorias' | 'publicar'

function Panel({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('produtos')
  const { hasDraft } = useCatalog()
  const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'categorias', label: 'Categorias', icon: FolderTree },
    { id: 'publicar', label: 'Publicar', icon: Upload },
  ]

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-marrom/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={52} priority />
            <div>
              <p className="font-serif text-lg font-semibold text-verde">Painel</p>
              <p className="text-xs text-marrom-suave">{hasDraft ? 'Alterações salvas neste navegador' : 'Catálogo publicado'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href="#inicio" className="btn-ghost px-3" target="_blank" rel="noopener">
              <ExternalLink aria-hidden size={17} /> <span className="hidden sm:inline">Ver site</span>
            </a>
            <button type="button" onClick={onLogout} className="btn-ghost px-3">
              <LogOut aria-hidden size={17} /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <nav aria-label="Seções do painel" className="mx-auto max-w-6xl px-2 sm:px-4">
          <ul className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? 'page' : undefined}
                  className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold ${
                    tab === id ? 'border-verde text-verde' : 'border-transparent text-marrom-suave hover:text-verde'
                  }`}
                >
                  <Icon aria-hidden size={17} /> {label}
                  {id === 'publicar' && hasDraft && <span className="size-2 rounded-full bg-terracota" aria-label="há alterações não publicadas" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === 'produtos' && <ProductsTab />}
        {tab === 'categorias' && <CategoriesTab />}
        {tab === 'publicar' && <PublishTab />}
      </main>
    </div>
  )
}
