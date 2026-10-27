import { CalendarDays, Coffee, Users } from 'lucide-react'
import { useState } from 'react'
import { company } from '../config/company'
import { buildCoffeeBreakMessage, type CoffeeBreakInfo } from '../whatsapp/message'
import { Dialog } from './Dialog'
import { SendActions } from './SendActions'

export function CoffeeBreak() {
  const [open, setOpen] = useState(false)
  const photo = company.coffeeBreakImage

  return (
    <section id="coffee-break" aria-labelledby="coffee-titulo" className="on-dark bg-verde text-creme">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-16 md:py-24">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-dourado uppercase">Coffee break</p>
          <h2 id="coffee-titulo" className="mt-4 text-4xl leading-tight font-semibold text-white sm:text-5xl">
            Do Nono no seu próximo encontro.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-creme/85">
            Para reuniões, eventos e encontros, consulte as opções em bandejas e caixas. Conte o tipo de evento e a data, e o
            atendimento informa o que está disponível.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn mt-8 bg-dourado px-6 text-base text-marrom hover:bg-[#e2bb5b]"
          >
            <Coffee aria-hidden size={19} /> Consultar coffee break
          </button>
        </div>

        {photo ? (
          <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
        ) : (
          <ul className="grid gap-px overflow-hidden rounded-3xl border border-white/15 text-creme/90">
            {[
              { icon: Users, title: 'Quantas pessoas', text: 'Informe uma estimativa para orientar a consulta.' },
              { icon: CalendarDays, title: 'Data do evento', text: 'Uma preferência, confirmada pelo atendimento.' },
              { icon: Coffee, title: 'Bandejas e caixas', text: 'Veja os itens de coffee break no catálogo.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 bg-white/[0.04] p-6">
                <Icon aria-hidden size={22} className="mt-0.5 shrink-0 text-dourado" />
                <div>
                  <p className="font-serif text-xl text-white">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Consultar coffee break" className="max-w-xl">
        <CoffeeBreakForm />
      </Dialog>
    </section>
  )
}

function CoffeeBreakForm() {
  const [info, setInfo] = useState<CoffeeBreakInfo>({ eventType: '', date: '', people: '', notes: '' })
  const set = (key: keyof CoffeeBreakInfo) => (e: { target: { value: string } }) => setInfo((i) => ({ ...i, [key]: e.target.value }))
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-5 px-5 pb-6">
      <p className="text-marrom-suave">Todos os campos são opcionais. A mensagem é aberta no WhatsApp para você revisar e enviar.</p>
      <div>
        <label htmlFor="cb-tipo" className="label">Tipo de evento</label>
        <input id="cb-tipo" className="field" maxLength={80} placeholder="Ex.: reunião, aniversário, confraternização" value={info.eventType} onChange={set('eventType')} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cb-data" className="label">Data desejada</label>
          <input id="cb-data" type="date" min={today} className="field" value={info.date} onChange={set('date')} />
        </div>
        <div>
          <label htmlFor="cb-pessoas" className="label">Número de pessoas</label>
          <input
            id="cb-pessoas"
            inputMode="numeric"
            className="field"
            maxLength={5}
            value={info.people}
            onChange={(e) => setInfo((i) => ({ ...i, people: e.target.value.replace(/\D/g, '') }))}
          />
        </div>
      </div>
      <div>
        <label htmlFor="cb-obs" className="label">Observações</label>
        <textarea id="cb-obs" rows={3} maxLength={600} className="field" value={info.notes} onChange={set('notes')} />
      </div>
      <SendActions message={buildCoffeeBreakMessage(info)} primaryLabel="Consultar pelo WhatsApp" copyLabel="Copiar mensagem" />
    </div>
  )
}
