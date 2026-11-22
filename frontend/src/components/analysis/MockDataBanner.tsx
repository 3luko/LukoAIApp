import { InfoIcon } from '../ui/icons'

/** Clearly marks a view as showing sample data, not a real analysis. */
export function MockDataBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-card border border-caution/40 bg-caution/10 px-4 py-3 text-sm"
    >
      <InfoIcon className="mt-px shrink-0 text-caution" />
      <p>
        <span className="font-semibold">Sample data.</span>{' '}
        <span className="text-muted">
          These numbers are placeholders for layout only. They are not calculated from your inputs and are not a
          recommendation.
        </span>
      </p>
    </div>
  )
}
