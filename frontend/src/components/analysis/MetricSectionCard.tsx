import type { MetricSection } from '../../types/analysis'
import { Card } from '../ui/Card'

interface MetricSectionCardProps {
  section: MetricSection
}

/** A titled list of label/value rows (e.g. a monthly cost breakdown). */
export function MetricSectionCard({ section }: MetricSectionCardProps) {
  return (
    <Card>
      <h3 className="font-semibold">{section.title}</h3>
      {section.description && <p className="mt-1 font-sans text-sm leading-relaxed text-muted">{section.description}</p>}
      <dl className="mt-4 divide-y divide-border">
        {section.metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-muted">{m.label}</dt>
            <dd className="text-base font-semibold tabular-nums text-fg">{m.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
