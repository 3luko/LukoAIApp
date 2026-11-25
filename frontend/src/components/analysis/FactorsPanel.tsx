import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Metric } from '../../types/analysis'
import { Button } from '../ui/Button'

interface FactorsPanelProps {
  open: boolean
  title: string
  /** The card being adjusted, so its live value is visible while the factors change. */
  metric: Metric | undefined
  explanation: string
  onClose: () => void
  children: ReactNode
}

/**
 * A side panel for adjusting the factors behind one card. It uses the browser's
 * native <dialog>, which gives a focus trap, Escape to close and a dimmed backdrop for free.
 */
export function FactorsPanel({ open, title, metric, explanation, onClose, children }: FactorsPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  // Keep the dialog's open state in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // The dialog has no padding, so a click on the element itself is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="factors-panel m-0 ml-auto h-dvh max-h-dvh w-full max-w-md border-l border-border bg-surface p-0 text-fg backdrop:bg-bg/70"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id={titleId} className="font-semibold">
              {title}
            </h2>
            {metric && (
              <p aria-live="polite" className="mt-1 text-2xl font-semibold tabular-nums">
                {metric.value}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control px-2 py-1 text-sm text-muted transition-colors duration-(--duration-fast) hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <p className="font-sans text-sm leading-relaxed text-muted">{explanation}</p>
          {children}
        </div>

        <footer className="border-t border-border p-5">
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </footer>
      </div>
    </dialog>
  )
}
