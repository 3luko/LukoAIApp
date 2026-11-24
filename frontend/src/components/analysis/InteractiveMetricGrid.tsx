import { useState } from 'react'
import { metricExplanations } from '../../data/metricExplanations'
import type { AssumptionKey } from '../../lib/assumptionFields'
import type { Metric } from '../../types/analysis'
import type { AssumptionsInput, CalculateResponse } from '../../types/calculate'
import { StatCard } from '../ui/StatCard'
import { AssumptionsEditor } from './AssumptionsEditor'
import type { DisabledReasons } from './AssumptionsEditor'
import { FactorsPanel } from './FactorsPanel'
import { MetricHoverCard } from './MetricHoverCard'

/** Everything the cards need to let the investor change assumptions. */
export interface AssumptionEditing {
  overrides: AssumptionsInput
  baseline: CalculateResponse['assumptions'] | null
  disabled: DisabledReasons
  resetVersion: number
  onChange: (key: AssumptionKey, value: number | undefined) => void
  onReset: (keys: AssumptionKey[]) => void
}

interface InteractiveMetricGridProps {
  metrics: Metric[]
  editing: AssumptionEditing
}

/**
 * The headline cards. Hover (or focus) a card for a plain-language explanation and an
 * "Adjust" button, which opens a side panel with the factors behind that card. The numbers
 * update live as the factors change.
 */
export function InteractiveMetricGrid({ metrics, editing }: InteractiveMetricGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const active = metrics.find((metric) => metric.id === activeId)

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const id = metric.id
          const info = id ? metricExplanations[id] : undefined
          if (!id || !info) {
            return <StatCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} tone={metric.tone} />
          }
          return <MetricHoverCard key={id} metric={metric} explanation={info.text} onAdjust={() => setActiveId(id)} />
        })}
      </div>

      <FactorsPanel
        open={active !== undefined}
        title={active ? `Factors for ${active.label.toLowerCase()}` : ''}
        metric={active}
        explanation={active?.id ? metricExplanations[active.id].text : ''}
        onClose={() => setActiveId(null)}
      >
        {active?.id && (
          <AssumptionsEditor
            idPrefix={`factors-${active.id}`}
            keys={metricExplanations[active.id].factors}
            overrides={editing.overrides}
            baseline={editing.baseline}
            disabled={editing.disabled}
            resetVersion={editing.resetVersion}
            onChange={editing.onChange}
            onReset={editing.onReset}
          />
        )}
      </FactorsPanel>
    </>
  )
}
