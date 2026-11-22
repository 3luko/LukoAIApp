import type { Tone } from '../../types/analysis'

const valueTones: Record<Tone, string> = {
  neutral: 'text-fg',
  positive: 'text-positive',
  caution: 'text-caution',
  negative: 'text-negative',
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: Tone
}

export function StatCard({ label, value, hint, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4 sm:p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums sm:text-3xl ${valueTones[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
