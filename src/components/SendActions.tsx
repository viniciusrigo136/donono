import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { Instagram } from './InstagramIcon'
import { useState } from 'react'
import { company, settings } from '../config/company'
import { planWhatsApp } from '../whatsapp/message'

type CopyState = 'idle' | 'copied' | 'manual'

/**
 * Ações de envio: abrir o WhatsApp (quando configurado) e copiar a mensagem.
 * Se a área de transferência falhar, mostra o texto completo para cópia manual.
 */
export function SendActions({
  message,
  primaryLabel,
  copyLabel = 'Copiar seleção',
  disabled,
}: {
  message: string
  primaryLabel: string
  copyLabel?: string
  disabled?: boolean
}) {
  const [copy, setCopy] = useState<CopyState>('idle')
  const [opened, setOpened] = useState(false)
  const plan = planWhatsApp(company.whatsappNumber, message, settings.maxWhatsAppUrlLength)

  const copyMessage = async () => {
    try {
      if (!navigator.clipboard) throw new Error('indisponível')
      await navigator.clipboard.writeText(message)
      setCopy('copied')
    } catch {
      setCopy('manual')
    }
  }

  const openWhatsApp = async () => {
    if (plan.status === 'unconfigured') return
    if (plan.status === 'too_long') await copyMessage()
    window.open(plan.url, '_blank', 'noopener,noreferrer')
    setOpened(true)
  }

  return (
    <div className="space-y-3">
      {plan.status === 'unconfigured' ? (
        <div className="rounded-xl bg-white p-4 text-sm leading-relaxed">
          <p className="font-semibold text-marrom">O atendimento por WhatsApp ainda não está disponível neste site.</p>
          <p className="mt-1 text-marrom-suave">Copie a mensagem e envie pelo canal de sua preferência.</p>
          <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 font-semibold text-verde underline underline-offset-4">
            <Instagram aria-hidden size={16} /> {company.instagramHandle}
          </a>
        </div>
      ) : (
        <>
          {plan.status === 'too_long' && (
            <p className="rounded-xl bg-dourado/15 p-3 text-sm leading-relaxed text-marrom">
              Sua seleção é extensa. Ao abrir o WhatsApp, a lista completa será copiada: cole-a na conversa antes de enviar.
            </p>
          )}
          <button type="button" onClick={openWhatsApp} disabled={disabled} className="btn-primary w-full text-base">
            <MessageCircle aria-hidden size={19} />
            {primaryLabel}
            <ExternalLink aria-hidden size={15} className="opacity-70" />
          </button>
        </>
      )}

      <button type="button" onClick={copyMessage} disabled={disabled} className="btn-secondary w-full">
        {copy === 'copied' ? <Check aria-hidden size={17} /> : <Copy aria-hidden size={17} />}
        {copy === 'copied' ? 'Copiado' : copyLabel}
      </button>

      <div aria-live="polite" className="text-sm leading-relaxed text-marrom-suave">
        {opened && (
          <p>
            O WhatsApp foi aberto em outra aba com a mensagem pronta. A consulta só é enviada quando você tocar em enviar no aplicativo;
            disponibilidade e valores são confirmados pelo atendimento.
          </p>
        )}
        {copy === 'manual' && (
          <div className="mt-2">
            <label htmlFor="mensagem-manual" className="label">
              Não foi possível copiar automaticamente. Selecione o texto abaixo e copie:
            </label>
            <textarea
              id="mensagem-manual"
              readOnly
              value={message}
              rows={8}
              className="field font-mono text-sm"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </div>
  )
}
