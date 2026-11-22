/**
 * The only place that knows the analysis endpoint's URL. It calls our own backend,
 * never RentCast or Gemini directly.
 *
 * In development the Vite dev server proxies `/api/*` to the backend (see vite.config.ts),
 * so the browser only ever talks to its own origin. Set VITE_API_BASE_URL to point somewhere
 * else (for example in a deployed build).
 */
import type {
  AssumptionsInput,
  CalculateRequest,
  CalculateResponse,
  Financing,
  Management,
} from '../../types/calculate'
import type { InvestorFormValues } from '../../types/form'

const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? '/api'
const TIMEOUT_MS = 10_000

export type ApiErrorKind = 'network' | 'timeout' | 'invalid-input' | 'server'

/** A failed API call, with a message that is safe to show to the user. */
export class ApiError extends Error {
  kind: ApiErrorKind

  constructor(kind: ApiErrorKind, message: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}

/**
 * Turns the submitted form into the request body.
 * `inputs` must already have passed isInvestorFormValues, which guarantees the select values
 * are valid, so the two casts below are safe.
 */
export function buildCalculateRequest(
  inputs: InvestorFormValues,
  assumptions: AssumptionsInput = {},
): CalculateRequest {
  return {
    property: { price: inputs.listPrice },
    investor: {
      downPayment: inputs.downPayment,
      financing: inputs.financing as Financing,
      monthlyRent: inputs.expectedRent,
      management: inputs.management as Management,
    },
    assumptions,
  }
}

/** FastAPI's 422 body is { detail: [{ loc, msg }] }. Returns the messages, if it has that shape. */
function validationMessages(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || !('detail' in body) || !Array.isArray(body.detail)) {
    return []
  }
  return body.detail
    .map((item: unknown) =>
      typeof item === 'object' && item !== null && 'msg' in item && typeof item.msg === 'string'
        ? item.msg
        : '',
    )
    .filter(Boolean)
}

/**
 * Calls POST /analysis/calculate. Pass an AbortSignal to cancel a stale request; a cancelled
 * request rejects with the browser's AbortError, which callers should ignore.
 */
export async function calculateAnalysis(
  request: CalculateRequest,
  signal?: AbortSignal,
): Promise<CalculateResponse> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(`${API_BASE}/analysis/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: combined,
    })
  } catch (error) {
    if (signal?.aborted) throw error // cancelled by the caller, not a failure
    if (timeout.aborted) {
      throw new ApiError('timeout', 'The calculation took too long. Please try again.')
    }
    throw new ApiError('network', 'We couldn’t reach the server. Check your connection and try again.')
  }

  if (response.status === 422) {
    const messages = validationMessages(await response.json().catch(() => null))
    throw new ApiError(
      'invalid-input',
      messages.length > 0 ? `Check your inputs: ${messages.join(' ')}` : 'Some of your inputs are not valid.',
    )
  }
  if (!response.ok) {
    throw new ApiError('server', 'Something went wrong on our side. Please try again.')
  }

  try {
    return (await response.json()) as CalculateResponse
  } catch {
    throw new ApiError('server', 'The server sent an unexpected response. Please try again.')
  }
}
