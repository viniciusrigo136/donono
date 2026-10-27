import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { discardDraft, loadCatalog, loadDraft, publishedCatalog, saveDraft, visibleCategories, visibleProducts } from '../catalog/catalogStore'
import type { Catalog, Category, Product } from '../catalog/types'

interface CatalogContextValue {
  catalog: Catalog
  products: Product[]
  categories: Category[]
  hasDraft: boolean
  /** Salva alterações do painel como rascunho neste navegador. Retorna false se o armazenamento falhar. */
  updateCatalog: (next: Catalog) => boolean
  resetToPublished: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(loadCatalog)
  const [hasDraft, setHasDraft] = useState(() => loadDraft() !== null)

  // Mantém site e painel sincronizados entre abas do mesmo navegador.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && !e.key.startsWith('donono:catalog')) return
      setCatalog(loadCatalog())
      setHasDraft(loadDraft() !== null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updateCatalog = useCallback((next: Catalog) => {
    const stamped = { ...next, updatedAt: new Date().toISOString() }
    const ok = saveDraft(stamped)
    setCatalog(stamped)
    setHasDraft(ok)
    return ok
  }, [])

  const resetToPublished = useCallback(() => {
    discardDraft()
    setCatalog(publishedCatalog)
    setHasDraft(false)
  }, [])

  const value = useMemo(() => {
    const products = visibleProducts(catalog)
    return { catalog, products, categories: visibleCategories(catalog, products), hasDraft, updateCatalog, resetToPublished }
  }, [catalog, hasDraft, updateCatalog, resetToPublished])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog fora do CatalogProvider')
  return ctx
}
