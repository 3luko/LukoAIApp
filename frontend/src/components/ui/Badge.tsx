import type { ReactNode } from 'react'
import type { Tone } from '../../types/analysis'

const tones: Record<Tone, string> = {
  neutral: 'border border-border bg-surface-2 text-muted',
  positive: 'bg-positive/15 text-positive',
  caution: 'bg-caution/15 text-caution',
  negative: 'bg-negative/15 text-negative',
}

interface BadgeProps {
  children: ReactNode
  tone?: Tone
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  )
}
