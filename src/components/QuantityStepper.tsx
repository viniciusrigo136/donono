import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { sanitizeQuantity } from '../cart/cart'

interface Props {
  value: number
  max: number
  min?: number
  onChange: (value: number) => void
  label: string
  size?: 'sm' | 'md'
}

/** Controle de quantidade: só aceita inteiros entre min e max. */
export function QuantityStepper({ value, max, min = 1, onChange, label, size = 'md' }: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const btn = size === 'sm' ? 'size-10' : 'size-11'

  const commit = () => {
    if (draft === null) return
    const q = sanitizeQuantity(draft, max)
    if (q !== null) onChange(q)
    setDraft(null)
  }

  return (
    <div className="inline-flex items-center rounded-full border border-marrom/20 bg-white" role="group" aria-label={label}>
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full text-verde hover:bg-verde/5 disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Diminuir quantidade de ${label}`}
      >
        <Minus aria-hidden size={18} />
      </button>
      <input
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={`Quantidade de ${label}`}
        className="w-10 bg-transparent text-center text-base font-semibold tabular-nums focus:outline-none"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 3))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
      <button
        type="button"
        className={`${btn} grid place-items-center rounded-full text-verde hover:bg-verde/5 disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Aumentar quantidade de ${label}`}
      >
        <Plus aria-hidden size={18} />
      </button>
    </div>
  )
}
