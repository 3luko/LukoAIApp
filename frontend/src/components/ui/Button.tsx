import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-(--duration-fast) ease-(--ease-out) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'border border-border bg-surface text-fg hover:bg-surface-2 hover:border-subtle',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

function classes(variant: Variant, size: Size, extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={classes(variant, size, className)} {...props} />
}

interface LinkButtonProps {
  to: string
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  /** Animate the page change with a view transition (see "Page transition" in index.css). */
  viewTransition?: boolean
}

/** A router link styled like a button, for navigation actions. */
export function LinkButton({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className,
  viewTransition,
}: LinkButtonProps) {
  return (
    <Link to={to} viewTransition={viewTransition} className={classes(variant, size, className)}>
      {children}
    </Link>
  )
}
