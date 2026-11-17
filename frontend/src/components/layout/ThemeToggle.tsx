import { useState } from 'react'
import { MoonIcon, SunIcon } from '../ui/icons'

const STORAGE_KEY = 'lukoai-theme'

/**
 * Toggles the `dark` class on <html>. index.html applies the saved choice
 * before React loads, so the initial state is read from the DOM.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
    setIsDark(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="grid size-10 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
