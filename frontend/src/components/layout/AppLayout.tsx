import { useLayoutEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { AppFooter } from './AppFooter'
import { AppHeader } from './AppHeader'

/**
 * Shell shared by every route: header, page content (Outlet), footer.
 * The landing page ("/") is a single composition of its own, so it has no header bar and
 * no footer divider.
 */
export function AppLayout() {
  const isLanding = useLocation().pathname === '/'

  // Tells the page transition (index.css) which way to slide. Going to the landing page is
  // "back", going anywhere else is "forward". This runs while the new page is committed,
  // before the browser captures it, so it also covers the Back/Forward buttons.
  useLayoutEffect(() => {
    document.documentElement.dataset.pageTransition = isLanding ? 'back' : 'forward'
  }, [isLanding])

  return (
    <div className="flex min-h-dvh flex-col">
      {!isLanding && <AppHeader />}
      <main className={`flex-1 ${isLanding ? 'flex flex-col' : ''}`}>
        <Outlet />
      </main>
      <AppFooter bare={isLanding} />
      <ScrollRestoration />
    </div>
  )
}
