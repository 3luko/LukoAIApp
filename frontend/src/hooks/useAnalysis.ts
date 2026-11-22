import { useEffect, useRef, useState } from 'react'
import { ApiError, buildCalculateRequest, calculateAnalysis } from '../lib/api/analysisApi'
import type { AssumptionsInput, CalculateRequest, CalculateResponse } from '../types/calculate'
import type { InvestorFormValues } from '../types/form'

/** Wait this long after the last change before calling the API (for override edits). */
const DEBOUNCE_MS = 300

type Settled = { key: string; data: CalculateResponse | null; error: string | null }

export type AnalysisStatus = 'loading' | 'success' | 'error'

export interface AnalysisState {
  status: AnalysisStatus
  /** The latest result. While reloading or after a failed reload it is the previous result. */
  data: CalculateResponse | null
  error: string | null
  retry: () => void
}

const NO_OVERRIDES: AssumptionsInput = {}

/**
 * Calculates the analysis for the submitted inputs by calling the backend, and recalculates
 * (debounced) when the overrides change. It never delays the first request.
 *
 * Status is derived, not stored: a result only counts when it belongs to the current
 * request, so there's no "set loading" step and a stale response can't overwrite a newer one.
 * Each request is aborted when a newer one starts or the page unmounts.
 */
export function useAnalysis(
  inputs: InvestorFormValues,
  assumptions: AssumptionsInput = NO_OVERRIDES,
): AnalysisState {
  const requestKey = JSON.stringify(buildCalculateRequest(inputs, assumptions))
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled | null>(null)
  const hasRequested = useRef(false)
  const key = `${attempt}:${requestKey}`

  useEffect(() => {
    const request = JSON.parse(requestKey) as CalculateRequest
    const controller = new AbortController()
    const delay = hasRequested.current ? DEBOUNCE_MS : 0

    const timer = setTimeout(() => {
      hasRequested.current = true
      calculateAnalysis(request, controller.signal)
        .then((data) => setSettled({ key, data, error: null }))
        .catch((error: unknown) => {
          if (controller.signal.aborted) return
          const message =
            error instanceof ApiError ? error.message : 'Something went wrong. Please try again.'
          setSettled((previous) => ({ key, data: previous?.data ?? null, error: message }))
        })
    }, delay)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [key, requestKey])

  const current = settled?.key === key
  return {
    status: !current ? 'loading' : settled.error ? 'error' : 'success',
    data: settled?.data ?? null,
    error: current ? settled.error : null,
    retry: () => setAttempt((count) => count + 1),
  }
}
