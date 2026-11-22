import type { ComponentProps } from 'react'

/**
 * The LukoAI wordmark. Monospace is part of the brand, so the font comes from the base
 * styles. The size is up to the caller (small in the header, large on the landing page).
 */
export function Wordmark({ className = '', ...props }: ComponentProps<'span'>) {
  return (
    <span className={`inline-block font-bold tracking-tight ${className}`} {...props}>
      LukoAI
    </span>
  )
}
