import { CheckCircle2, TriangleAlert } from 'lucide-react'

export function Feedback({ feedback }: { feedback: { ok: boolean; text: string } | null }) {
  return (
    <div aria-live="polite" className="min-h-0">
      {feedback && (
        <p
          className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            feedback.ok ? 'bg-verde/10 text-verde' : 'bg-terracota/10 text-terracota-texto'
          }`}
        >
          {feedback.ok ? <CheckCircle2 aria-hidden size={18} className="mt-px shrink-0" /> : <TriangleAlert aria-hidden size={18} className="mt-px shrink-0" />}
          {feedback.text}
        </p>
      )}
    </div>
  )
}
