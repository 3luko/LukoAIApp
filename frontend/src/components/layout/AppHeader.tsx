import { Link, NavLink } from 'react-router'
import { PageContainer } from './PageContainer'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { to: '/analyze', label: 'Analyze property' },
]

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-fg">L</span>
          <span className="text-lg">LukoAI</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:block ${
                  isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </PageContainer>
    </header>
  )
}
