import type { AnalysisStatus } from '../../hooks/useAnalysis'
import { assumptionsSection, breakdownSection, keyMetrics } from '../../lib/formatAnalysis'
import type { CalculateResponse } from '../../types/calculate'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { InfoIcon } from '../ui/icons'
import { MetricGrid } from './MetricGrid'
import { MetricSectionCard } from './MetricSectionCard'

interface CalculationResultsProps {
  status: AnalysisStatus
  /** The latest result. While reloading it is the previous one, so the page doesn't blank out. */
  data: CalculateResponse | null
  error: string | null
  onRetry: () => void
}

/** The calculated cash flow, with its loading, error and warning states. Presentational only. */
export function CalculationResults({ status, data, error, onRetry }: CalculationResultsProps) {
  if (!data) {
    if (status === 'error') {
      return (
        <div role="alert">
          <Card className="space-y-4">
            <h2 className="font-semibold text-negative">We couldn’t calculate your analysis</h2>
            <p className="font-sans text-sm leading-relaxed text-muted">{error}</p>
            <Button type="button" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          </Card>
        </div>
      )
    }
    return (
      <div role="status">
        <Card>
          <p className="text-muted">Calculating your analysis…</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* A live region that is always present, so changes are announced. */}
      <p role="status" className="min-h-5 text-sm text-muted">
        {status === 'loading' ? 'Updating…' : ''}
      </p>

      {status === 'error' && (
        <div role="alert" className="flex items-center justify-between gap-4 rounded-card border border-negative/40 bg-negative/10 px-4 py-3 text-sm">
          <p>
            <span className="font-semibold text-negative">Couldn’t update.</span>{' '}
            <span className="text-muted">{error} The numbers below are from the last successful calculation.</span>
          </p>
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      <section aria-label="Key metrics">
        <MetricGrid metrics={keyMetrics(data)} />
      </section>

      {data.warnings.length > 0 && (
        <div
          role="note"
          className="flex items-start gap-3 rounded-card border border-caution/40 bg-caution/10 px-4 py-3 text-sm"
        >
          <InfoIcon className="mt-px shrink-0 text-caution" />
          <div>
            <p className="font-semibold">Some costs are missing</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted">
              {data.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
            <p className="mt-1 text-muted">Until they are included, cash flow looks better than it really is.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricSectionCard section={breakdownSection(data)} />
        <MetricSectionCard section={assumptionsSection(data)} />
      </div>
    </div>
  )
}
