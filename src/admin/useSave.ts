import { useCallback, useState } from 'react'
import type { Catalog } from '../catalog/types'
import { useCatalog } from '../state/CatalogContext'

/** Salva o catálogo e expõe uma mensagem de feedback para a interface. */
export function useSave() {
  const { catalog, updateCatalog } = useCatalog()
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)

  const save = useCallback(
    (mutate: (c: Catalog) => Catalog, okText = 'Alteração salva.') => {
      const ok = updateCatalog(mutate(catalog))
      setFeedback(
        ok
          ? { ok, text: okText }
          : { ok, text: 'Não foi possível salvar neste navegador (armazenamento cheio ou bloqueado). Exporte o catálogo para não perder o trabalho.' },
      )
      return ok
    },
    [catalog, updateCatalog],
  )

  return { catalog, save, feedback, clearFeedback: () => setFeedback(null) }
}
