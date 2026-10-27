import { Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../state/CartContext'
import { Logo } from './Logo'

const LINKS = [
  { href: '#produtos', label: 'Produtos' },
  { href: '#coffee-break', label: 'Coffee break' },
  { href: '#contato', label: 'Contato' },
]

export function Header() {
  const { summary, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const count = summary.totalUnits

  return (
    <header className="sticky top-0 z-30 border-b border-marrom/10 bg-white">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6">
        <a href="#inicio" className="-my-1 rounded-md" aria-label="Do Nono — início">
          <Logo size={68} priority className="sm:hidden" />
          <Logo size={76} priority className="hidden sm:block" />
        </a>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="rounded-full px-4 py-2.5 text-sm font-semibold text-marrom hover:text-verde">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-verde px-4 text-sm font-semibold text-white hover:bg-verde-escuro"
            aria-label={count ? `Abrir seleção, ${count} ${count === 1 ? 'unidade' : 'unidades'}` : 'Abrir seleção, vazia'}
          >
            <ShoppingBag aria-hidden size={19} />
            <span className="hidden sm:inline">Seleção</span>
            <span
              aria-hidden
              className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums ${
                count ? 'bg-dourado text-marrom' : 'bg-white/15 text-white'
              }`}
            >
              {count}
            </span>
          </button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-verde hover:bg-verde/5 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="menu-mobile" aria-label="Menu" className="border-t border-marrom/10 bg-white md:hidden">
          <ul className="mx-auto max-w-6xl px-2 py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-semibold text-marrom hover:bg-creme"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
