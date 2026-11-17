import { Outlet, ScrollRestoration } from 'react-router'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'

/** Shell shared by every route: header, page content (Outlet), footer. */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
      <ScrollRestoration />
    </div>
  )
}
