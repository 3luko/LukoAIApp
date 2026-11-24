import type { AssumptionKey } from '../lib/assumptionFields'

export interface MetricExplanation {
  /** Plain-language description shown when a card is hovered or focused. */
  text: string
  /** The assumptions that feed this figure, in the order they are shown. */
  factors: AssumptionKey[]
}

/** Keyed by the `id` of the headline metrics (see keyMetrics in lib/formatAnalysis.ts). */
export const metricExplanations: Record<string, MetricExplanation> = {
  cashFlow: {
    text: 'The money left over each month after every cost, including the loan payment. Above zero, the rent covers everything. Below zero, you would add money each month to cover the gap.',
    factors: [
      'vacancyRate',
      'maintenanceRate',
      'managementRate',
      'capexRate',
      'monthlyUtilities',
      'interestRate',
      'loanTermYears',
    ],
  },
  rent: {
    text: 'The monthly rent you entered. Vacancy allows for the months the property sits empty, so the rent you actually collect is a little lower than this figure.',
    factors: ['vacancyRate'],
  },
  noi: {
    text: 'Net operating income: the rent you collect after vacancy, minus the costs of running the property (tax, insurance, HOA, utilities, maintenance and management). It leaves out the loan payment and the CapEx reserve.',
    factors: ['vacancyRate', 'maintenanceRate', 'managementRate', 'monthlyUtilities'],
  },
  loanPayment: {
    text: 'What you pay the lender each month for principal and interest. It depends on the loan amount (the price minus your down payment), the interest rate and the term. It does not include tax or insurance.',
    factors: ['interestRate', 'loanTermYears'],
  },
}
