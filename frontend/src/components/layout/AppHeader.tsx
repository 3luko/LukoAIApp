import { Link, NavLink } from 'react-router'
import { PageContainer } from './PageContainer'
import { Wordmark } from './Wordmark'

const navLinks = [{ to: '/analyze', label: 'Analyze property' }]

/** Header for every page except the landing page, which has its own composition. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          viewTransition
          aria-label="LukoAI home"
          className="rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Wordmark className="text-lg" />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-control px-3 py-2 text-sm font-medium transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-accent ${
                  isActive ? 'text-fg' : 'text-muted hover:text-fg'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </PageContainer>
    </header>
  )
}
