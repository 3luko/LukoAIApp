import { investorFormGroups } from '../data/formFields'
import type { InvestorFormValues } from '../types/form'

/** One message per invalid field. An empty object means the form is valid. */
export type InvestorFormErrors = Partial<Record<keyof InvestorFormValues, string>>

/** Allowed values for a select field, read from formFields.ts so the lists live in one place. */
function optionsFor(fieldId: string): string[] {
  const field = investorFormGroups.flatMap((group) => group.fields).find((f) => f.id === fieldId)
  return field?.options?.map((option) => option.value) ?? []
}

/** Returns an error message, or undefined if a select value is one of its options. */
function checkChoice(value: string | undefined, options: string[]): string | undefined {
  if (!value) return 'Choose an option.'
  if (!options.includes(value)) return 'Choose one of the listed options.'
  return undefined
}

/**
 * Returns an error message, or undefined if the text is a valid amount.
 * Commas and $ signs are stripped first, so "425,000" and "$425,000" both work.
 */
function checkAmount(value: string | undefined, required: boolean): string | undefined {
  const text = (value ?? '').trim()
  if (text === '') return required ? 'Enter an amount.' : undefined

  const amount = Number(text.replace(/[,$]/g, ''))
  if (!Number.isFinite(amount)) return 'Enter a number.'
  if (amount < 0) return 'Amount cannot be negative.'
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
    listPrice: checkAmount(raw.listPrice, false),
    propertyType: checkChoice(raw.propertyType, optionsFor('propertyType')),
    downPayment: checkAmount(raw.downPayment, true),
    financing: checkChoice(raw.financing, optionsFor('financing')),
    reserves: checkAmount(raw.reserves, true),
    expectedRent: checkAmount(raw.expectedRent, false),
    management: checkChoice(raw.management, optionsFor('management')),
    goal: checkChoice(raw.goal, optionsFor('goal')),
  }

  const errors: InvestorFormErrors = {}
  for (const field of Object.keys(checks) as (keyof InvestorFormValues)[]) {
    const message = checks[field]
    if (message) errors[field] = message
  }
  return errors
}
