/**
 * The assumptions an investor can change, how they are labeled, and how typed text becomes
 * the number the API expects (a percentage typed as "7.5" is sent as 0.075).
 * Defaults are NOT stored here: they come from the backend (the "baseline" response).
 */
import type { AssumptionsInput } from '../types/calculate'
import { formatMoney } from './formatAnalysis'

export type AssumptionKey = keyof AssumptionsInput
export type FieldKind = 'percent' | 'years' | 'money'

export interface AssumptionSpec {
  label: string
  kind: FieldKind
  prefix?: string
  /** One plain-language sentence about what the factor is. */
  hint: string
}

export const ASSUMPTION_SPECS: Record<AssumptionKey, AssumptionSpec> = {
  vacancyRate: {
    label: 'Vacancy rate (%)',
    kind: 'percent',
    hint: 'The share of the year the property sits empty.',
  },
  maintenanceRate: {
    label: 'Maintenance (% of rent)',
    kind: 'percent',
    hint: 'Routine repairs and upkeep.',
  },
  managementRate: {
    label: 'Management fee (% of rent)',
    kind: 'percent',
    hint: 'What a property manager charges.',
  },
  capexRate: {
    label: 'CapEx reserve (% of rent)',
    kind: 'percent',
    hint: 'Set aside for big repairs like a roof or heating system.',
  },
  interestRate: {
    label: 'Interest rate (%)',
    kind: 'percent',
    hint: 'The yearly rate on the loan.',
  },
  loanTermYears: {
    label: 'Loan term (years)',
    kind: 'years',
    hint: 'How long the loan lasts.',
  },
  monthlyUtilities: {
    label: 'Utilities you pay ($ per month)',
    kind: 'money',
    prefix: '$',
    hint: 'Only the utilities the landlord pays.',
  },
}

export type ParseResult = { ok: true; value: number | undefined } | { ok: false; error: string }

/**
 * Turns typed text into an API value. Blank means "no override" (use the default), which is
 * a valid result with `value: undefined`.
 */
export function parseAssumption(kind: FieldKind, text: string): ParseResult {
  const cleaned = text.replace(/[,$%\s]/g, '')
  if (cleaned === '') return { ok: true, value: undefined }

  const n = Number(cleaned)
  if (!Number.isFinite(n)) return { ok: false, error: 'Enter a number.' }

  switch (kind) {
    case 'percent':
      if (n < 0 || n > 100) return { ok: false, error: 'Enter a percentage from 0 to 100.' }
      return { ok: true, value: Number((n / 100).toFixed(6)) }
    case 'years':
      if (!Number.isInteger(n) || n < 1 || n > 50) {
        return { ok: false, error: 'Enter a whole number of years, from 1 to 50.' }
      }
      return { ok: true, value: n }
    case 'money':
      if (n < 0) return { ok: false, error: 'Amount cannot be negative.' }
      if (n > 1_000_000_000) return { ok: false, error: 'That amount is too large.' }
      return { ok: true, value: n }
  }
}

/** The number as it is typed into the field: 0.075 becomes "7.5". */
export function formatAssumption(kind: FieldKind, value: number): string {
  return kind === 'percent' ? String(Number((value * 100).toFixed(4))) : String(value)
}

/** The number as it is read in a sentence: "7.5%", "30 years", "$0.00". */
export function describeAssumption(kind: FieldKind, value: number): string {
  if (kind === 'percent') return `${formatAssumption(kind, value)}%`
  if (kind === 'years') return `${value} years`
  return `${formatMoney(value)} per month`
}
