import type { PropertySummary } from '../../types/analysis'
import { Card } from '../ui/Card'
import { HomeIcon } from '../ui/icons'

interface PropertySummaryCardProps {
  property: PropertySummary
}

export function PropertySummaryCard({ property }: PropertySummaryCardProps) {
  const details = [
    { label: 'Beds', value: property.beds },
    { label: 'Baths', value: property.baths },
    { label: 'Sq ft', value: property.sqft },
    { label: 'Built', value: property.yearBuilt },
  ]

  return (
    <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-control border border-border bg-surface-2 text-muted">
          <HomeIcon width={22} height={22} />
        </span>
        <div>
          <p className="font-semibold">{property.address}</p>
          <p className="text-sm text-muted">
            {property.propertyType} · Listed at {property.listPrice}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-4 gap-4 text-center sm:gap-6">
        {details.map((d) => (
          <div key={d.label}>
            <dt className="text-xs uppercase tracking-wide text-muted">{d.label}</dt>
            <dd className="text-lg font-semibold tabular-nums">{d.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
