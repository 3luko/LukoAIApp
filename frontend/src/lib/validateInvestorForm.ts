import { investorFormGroups } from '../data/formFields'
import type { InvestorFormValues } from '../types/form'

/** Earliest year built the backend accepts. */
const MIN_YEAR_BUILT = 1600

const currentYear = () => new Date().getFullYear()

/** One message per invalid field. An empty object means the form is valid. */
export type InvestorFormErrors = Partial<Record<keyof InvestorFormValues, string>>

/** Allowed values for a select field, read from formFields.ts so the lists live in one place. */
function optionsFor(fieldId: string): string[] {
  const field = investorFormGroups.flatMap((group) => group.fields).find((f) => f.id === fieldId)
  return field?.options?.map((option) => option.value) ?? []
}

/**
 * True if `value` is a complete, valid set of submitted form values. The results page uses
 * this to check router state (which anyone can change through the browser history) before
 * sending it to the backend. It mirrors the backend's rules for the fields it sends.
 */
export function isInvestorFormValues(value: unknown): value is InvestorFormValues {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>

  const isAmount = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0
  const isPositive = (x: unknown): x is number => isAmount(x) && x > 0
  const isYear = (x: unknown): boolean =>
    typeof x === 'number' && Number.isInteger(x) && x >= MIN_YEAR_BUILT && x <= currentYear()
  const isChoice = (x: unknown, fieldId: string): boolean =>
    typeof x === 'string' && optionsFor(fieldId).includes(x)

  return (
    typeof v.address === 'string' &&
    isPositive(v.listPrice) &&
    isAmount(v.downPayment) &&
    v.downPayment <= v.listPrice &&
    isAmount(v.reserves) &&
    isPositive(v.expectedRent) &&
    isChoice(v.propertyType, 'propertyType') &&
    isYear(v.yearBuilt) &&
    isAmount(v.annualPropertyTax) &&
    isAmount(v.annualInsurance) &&
    isAmount(v.monthlyHoa) &&
    isChoice(v.financing, 'financing') &&
    isChoice(v.management, 'management') &&
    isChoice(v.goal, 'goal')
  )
}

/** Returns an error message, or undefined if a select value is one of its options. */
function checkChoice(value: string | undefined, options: string[]): string | undefined {
  if (!value) return 'Choose an option.'
  if (!options.includes(value)) return 'Choose one of the listed options.'
  return undefined
}

/**
 * Converts form text like "425,000" or "$425,000" to a number.
 * Commas and $ signs are stripped first. Returns NaN if the text isn't a number.
 */
export function parseAmount(value: string | undefined): number {
  return Number((value ?? '').trim().replace(/[,$]/g, ''))
}

/**
 * Returns an error message, or undefined if the text is a valid amount.
 * `mustBePositive` rejects 0 as well (price and rent must be above zero).
 */
function checkAmount(
  value: string | undefined,
  required: boolean,
  mustBePositive = false,
): string | undefined {
  const text = (value ?? '').trim()
  if (text === '') return required ? 'Enter an amount.' : undefined

  const amount = parseAmount(text)
  if (!Number.isFinite(amount)) return 'Enter a number.'
  if (amount < 0) return 'Amount cannot be negative.'
  if (mustBePositive && amount === 0) return 'Amount must be greater than 0.'
  return undefined
}

/** Returns an error message, or undefined if the text is a whole year the backend accepts. */
function checkYear(value: string | undefined): string | undefined {
  const text = (value ?? '').trim()
  if (text === '') return 'Enter the year it was built.'

  const year = Number(text)
  if (!Number.isInteger(year)) return 'Enter a four-digit year, like 1998.'
  if (year < MIN_YEAR_BUILT || year > currentYear()) {
    return `Enter a year between ${MIN_YEAR_BUILT} and ${currentYear()}.`
  }
  return undefined
}

/**
 * Checks the raw form strings before they are converted into InvestorFormValues.
 * Frontend checks guide the user; the backend must still validate everything it receives.
 */
export function validateInvestorForm(raw: Record<string, string>): InvestorFormErrors {
  // Typing this as Record<keyof InvestorFormValues, ...> means TypeScript fails
  // if a field is added to the type but no check is written for it.
  const checks: Record<keyof InvestorFormValues, string | undefined> = {
    address: (raw.address ?? '').trim() === '' ? 'Enter the property address.' : undefined,
    listPrice: checkAmount(raw.listPrice, true, true),
    propertyType: checkChoice(raw.propertyType, optionsFor('propertyType')),
    yearBuilt: checkYear(raw.yearBuilt),
    annualPropertyTax: checkAmount(raw.annualPropertyTax, true),
    annualInsurance: checkAmount(raw.annualInsurance, true),
    monthlyHoa: checkAmount(raw.monthlyHoa, true),
    downPayment: checkAmount(raw.downPayment, true),
    financing: checkChoice(raw.financing, optionsFor('financing')),
    reserves: checkAmount(raw.reserves, true),
    expectedRent: checkAmount(raw.expectedRent, true, true),
    management: checkChoice(raw.management, optionsFor('management')),
    goal: checkChoice(raw.goal, optionsFor('goal')),
  }

  // The backend rejects a down payment larger than the price, so catch it here too.
  if (!checks.downPayment && !checks.listPrice && parseAmount(raw.downPayment) > parseAmount(raw.listPrice)) {
    checks.downPayment = 'Down payment cannot be more than the listing price.'
  }

  const errors: InvestorFormErrors = {}
  for (const field of Object.keys(checks) as (keyof InvestorFormValues)[]) {
    const message = checks[field]
    if (message) errors[field] = message
  }
  return errors
}