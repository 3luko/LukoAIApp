import type { ReactNode } from 'react'
import type { Tone } from '../../types/analysis'

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
