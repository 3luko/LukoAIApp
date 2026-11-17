import type { Metric } from '../../types/analysis'
import { StatCard } from '../ui/StatCard'

interface MetricGridProps {
  metrics: Metric[]
}

/** Headline metrics as a responsive grid of stat cards. */
export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <StatCard key={m.label} {...m} />
      ))}
    </div>
  )
}
