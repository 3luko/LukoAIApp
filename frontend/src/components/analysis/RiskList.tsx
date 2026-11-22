import type { RiskItem, Tone } from '../../types/analysis'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { AlertIcon } from '../ui/icons'

const severityTone: Record<RiskItem['severity'], Tone> = {
  low: 'neutral',
  medium: 'caution',
  high: 'negative',
}

interface RiskListProps {
  risks: RiskItem[]
}

export function RiskList({ risks }: RiskListProps) {
  return (
    <Card>
      <h3 className="flex items-center gap-2 font-semibold">
        <AlertIcon width={18} height={18} className="text-caution" />
        Risks to consider
      </h3>
      <ul className="mt-4 space-y-4">
        {risks.map((risk) => (
          <li key={risk.title} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{risk.title}</p>
              <p className="mt-0.5 font-sans text-sm leading-relaxed text-muted">{risk.detail}</p>
            </div>
            <Badge tone={severityTone[risk.severity]}>{risk.severity}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}
