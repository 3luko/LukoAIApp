import { useId } from 'react'
import type { Metric } from '../../types/analysis'
import { StatCard } from '../ui/StatCard'

interface MetricHoverCardProps {
  metric: Metric
  /** Plain-language explanation, revealed on hover and keyboard focus. */
  explanation: string
  onAdjust: () => void
}

/**
 * A result card that explains itself on hover and offers an "Adjust" button, which is only
 * visible on hover or keyboard focus.
 *
 * It is all CSS (group-hover and group-focus-within), so no React state is involved. The
 * button stays in the tab order, and focusing it reveals the explanation, so keyboard users
 * get the same thing as mouse users. On devices without hover, the button is always shown.
 */
export function MetricHoverCard({ metric, explanation, onAdjust }: MetricHoverCardProps) {
  const explanationId = useId()
  const reveal =
    'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100'

  return (
    <div className="group relative">
      <StatCard label={metric.label} value={metric.value} hint={metric.hint} tone={metric.tone} />

      <button
        type="button"
        onClick={onAdjust}
        aria-describedby={explanationId}
        aria-label={`Adjust factors for ${metric.label}`}
        className={`absolute right-3 top-3 rounded-control border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted transition-opacity duration-(--duration-fast) ease-(--ease-out) hover:text-fg focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent ${reveal}`}
      >
        Adjust
      </button>

      {/* Always in the document (so it can describe the button), only visible on hover/focus. */}
      <p
        id={explanationId}
        className="pointer-events-none invisible absolute inset-x-0 top-full z-10 mt-2 rounded-card border border-border bg-surface-2 p-3 font-sans text-xs leading-relaxed text-muted opacity-0 transition-opacity duration-(--duration-fast) ease-(--ease-out) group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {explanation}
      </p>
    </div>
  )
}
