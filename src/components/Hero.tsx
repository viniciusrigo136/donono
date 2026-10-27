import { ArrowDown } from 'lucide-react'
import { company } from '../config/company'
import { Logo } from './Logo'

export function Hero() {
  const photo = company.heroImage
  return (
    <section id="inicio" aria-labelledby="hero-titulo" className="overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-14 md:py-20">
        <div className="order-2 md:order-1">
          <p className="eyebrow">Massas · Pães · Coffee break</p>
          <h1 id="hero-titulo" className="mt-4 text-[2.6rem] leading-[1.05] font-semibold sm:text-6xl">
            Da nossa mesa para a sua.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-marrom-suave">
            Conheça os produtos Do Nono e monte sua seleção para consultar pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#produtos" className="btn-primary px-6 text-base">
              Explorar produtos
              <ArrowDown aria-hidden size={18} />
            </a>
            <a href="#coffee-break" className="btn-ghost text-base underline decoration-dourado decoration-2 underline-offset-4">
              Coffee break para eventos
            </a>
          </div>
        </div>

        <div className="order-1 md:order-2">
          {photo ? (
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-[1.5rem] object-cover md:aspect-[4/5] md:rounded-[2rem]"
            />
          ) : (
            // Até haver uma fotografia real, a própria logo ocupa o destaque, sobre branco.
            <div className="relative mx-auto aspect-square w-full max-w-[28rem]">
              <div aria-hidden className="absolute inset-0 rounded-full border border-dourado/60" />
              <div aria-hidden className="absolute inset-3 rounded-full bg-white sm:inset-4" />
              {/* Quadrado inscrito no círculo: a logo nunca é recortada. */}
              <div className="absolute inset-[15%]">
                <Logo priority className="size-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
