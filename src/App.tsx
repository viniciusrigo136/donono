import { lazy, Suspense, useSyncExternalStore } from 'react'
import { Site } from './components/Site'
import { CatalogProvider } from './state/CatalogContext'

const AdminApp = lazy(() => import('./admin/AdminApp'))

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const isAdminRoute = () => window.location.hash.startsWith('#/admin')

export default function App() {
  const admin = useSyncExternalStore(subscribe, isAdminRoute)
  return (
    <CatalogProvider>
      {admin ? (
        <Suspense fallback={<p className="p-8 text-center">Carregando painel…</p>}>
          <AdminApp />
        </Suspense>
      ) : (
        <Site />
      )}
    </CatalogProvider>
  )
}
