import { Clock, MapPin, Phone, ShoppingBag } from 'lucide-react'
import { Instagram } from './InstagramIcon'
import { useEffect, useState } from 'react'
import { company, settings } from '../config/company'
import { CartProvider, useCart } from '../state/CartContext'
import { useCatalog } from '../state/CatalogContext'
import { CartDrawer } from './CartDrawer'
import { CatalogSection } from './CatalogSection'
import { CoffeeBreak } from './CoffeeBreak'
import { Header } from './Header'
import { Hero } from './Hero'
import { Logo } from './Logo'

export function Site() {
  return (
    <CartProvider>
      <a href="#produtos" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-3 focus:font-semibold">
        Pular para os produtos
      </a>
      <DemoBanner />
      <Header />
      <main>
        <Hero />
        <CatalogSection />
        <CoffeeBreak />
        <About />
      </main>
      <Footer />
      <MobileCartBar />
      <CartDrawer />
      <Toast />
    </CartProvider>
  )
}

function DemoBanner() {
  const { hasDraft } = useCatalog()
  if (!settings.demoMode && !hasDraft) return null
  return (
    <div className="bg-marrom px-4 py-2 text-center text-xs leading-relaxed text-creme sm:text-sm">
      {settings.demoMode && 'Versão de demonstração: itens marcados como “Exemplo” não fazem parte do catálogo comercial.'}
      {hasDraft && ' Exibindo alterações do painel salvas neste navegador.'}
    </div>
  )
}

function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow">{company.slogan}</p>
        <h2 id="sobre-titulo" className="mt-4 text-4xl font-semibold sm:text-5xl">
          Do Nono
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-marrom-suave">
          Massas, pães e opções para coffee break. Monte sua seleção por aqui e fale com o atendimento para confirmar disponibilidade,
          valores e entrega.
        </p>
        <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-8">
          <Instagram aria-hidden size={18} /> Acompanhe no Instagram
        </a>
      </div>
    </section>
  )
}

function Footer() {
  const { summary } = useCart()
  const contacts = [
    company.phoneDisplay && { icon: Phone, text: company.phoneDisplay },
    company.address && { icon: MapPin, text: company.address },
    company.serviceArea && { icon: MapPin, text: company.serviceArea },
    company.openingHours && { icon: Clock, text: company.openingHours },
  ].filter(Boolean) as { icon: typeof Phone; text: string }[]

  return (
    <footer id="contato" className={`border-t border-marrom/10 bg-white ${summary.totalUnits ? 'pb-24 md:pb-0' : ''}`}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[auto_1fr_1fr] md:items-start md:gap-14">
        <Logo size={128} />
        <div>
          <h2 className="text-2xl font-semibold">Contato</h2>
          <ul className="mt-4 space-y-3">
            <li>
              <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 font-semibold text-verde underline-offset-4 hover:underline">
                <Instagram aria-hidden size={18} /> {company.instagramHandle}
              </a>
            </li>
            {contacts.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-marrom">
                <Icon aria-hidden size={18} className="mt-0.5 shrink-0 text-verde" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm leading-relaxed text-marrom-suave">
          As seleções enviadas pelo site são consultas. Pedidos, disponibilidade, valores e condições são confirmados pelo atendimento.
        </p>
      </div>
      <div className="border-t border-marrom/10 px-4 py-5 text-center text-xs text-marrom-suave">
        © {new Date().getFullYear()} {company.name} · {company.slogan}
      </div>
    </footer>
  )
}

function MobileCartBar() {
  const { summary, openCart } = useCart()
  if (!summary.totalUnits) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-marrom/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <button type="button" onClick={openCart} className="btn-primary w-full text-base">
        <ShoppingBag aria-hidden size={19} />
        Ver seleção · {summary.totalUnits} {summary.totalUnits === 1 ? 'unidade' : 'unidades'}
      </button>
    </div>
  )
}

/** Aviso visual curto + região viva para leitores de tela. */
function Toast() {
  const { status, isOpen } = useCart()
  const [hiddenId, setHiddenId] = useState<number | null>(null)

  useEffect(() => {
    if (!status) return
    const t = window.setTimeout(() => setHiddenId(status.id), 3200)
    return () => window.clearTimeout(t)
  }, [status])

  const visible = status && status.id !== hiddenId && !isOpen
  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {status?.text}
      </div>
      {visible && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-6">
          <p className="rounded-full bg-marrom px-5 py-3 text-sm font-semibold text-creme shadow-lg">{status.text}</p>
        </div>
      )}
    </>
  )
}
