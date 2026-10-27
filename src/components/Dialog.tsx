import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  /** Texto do título, usado também como nome acessível. */
  title: string
  hideTitle?: boolean
  variant?: 'center' | 'drawer'
  className?: string
  children: ReactNode
}

/**
 * Modal sobre o <dialog> nativo: foco preso no conteúdo, Escape fecha
 * e o foco volta ao elemento que abriu.
 */
export function Dialog({ open, onClose, title, hideTitle, variant = 'center', className = '', children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onClosed = () => {
      // O evento "close" é assíncrono: se o modal já foi reaberto, ignora.
      if (dialog.open) return
      onClose()
      const target = opener.current
      if (target && document.contains(target)) target.focus()
    }
    dialog.addEventListener('close', onClosed)
    return () => dialog.removeEventListener('close', onClosed)
  }, [onClose])

  const layout =
    variant === 'drawer'
      ? 'm-0 ml-auto h-dvh max-h-dvh w-full max-w-md'
      : 'm-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-3xl rounded-2xl'

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`overflow-hidden bg-creme p-0 text-marrom shadow-xl ${layout} ${className}`}
      onClick={(e) => {
        // Clique no fundo escurecido fecha.
        if (e.target === ref.current) ref.current?.close()
      }}
    >
      {open && (
        <div className="flex max-h-[inherit] h-full flex-col">
          <div className={`flex items-center justify-between gap-4 px-5 pt-4 ${hideTitle ? 'absolute right-0 top-0 z-10' : 'pb-3'}`}>
            {!hideTitle && <h2 className="text-xl font-semibold">{title}</h2>}
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="grid size-11 place-items-center rounded-full bg-white/90 text-verde hover:bg-white"
              aria-label="Fechar"
            >
              <X aria-hidden size={22} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  )
}
