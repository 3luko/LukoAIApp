/**
 * Turns the calculate response into display strings for the existing result components.
 * It only formats: every number comes from the backend. The one thing it decides is the
 * visual tone of the cash-flow tile, from the sign of the number.
 */
import type { Metric, MetricSection, Tone } from '../types/analysis'
import type { AssumptionOut, CalculateResponse, MoneyLine, Source } from '../types/calculate'

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 2 })

/** "$1,234.50", or "−$1,234.50" for negatives (a real minus sign, so meaning never depends on color). */
export function formatMoney(amount: number): string {
  const text = money.format(Math.abs(amount))
  return amount < 0 ? `−${text}` : text
}

const SOURCE_LABELS: Record<Source, string> = {
  investor: 'Your input',
  default: 'Default',
  estimate: 'Estimated',
  missing: 'Missing, counted as $0',
}

export function sourceLabel(source: Source): string {
  return SOURCE_LABELS[source]
}

function toneFor(amount: number): Tone {
  if (amount > 0) return 'positive'
  if (amount < 0) return 'negative'
  return 'neutral'
}

export function keyMetrics(result: CalculateResponse): Metric[] {
  const { cashFlow, income, noi, debtService } = result
  return [
    {
      id: 'cashFlow',
      label: 'Monthly cash flow',
      value: formatMoney(cashFlow.monthly),
      hint: `${formatMoney(cashFlow.annual)} per year`,
      tone: toneFor(cashFlow.monthly),
    },
    { id: 'rent', label: 'Monthly rent', value: formatMoney(income.grossRent.monthly), hint: sourceLabel(income.grossRent.source) },
    { id: 'noi', label: 'Net operating income', value: formatMoney(noi.monthly), hint: `${formatMoney(noi.annual)} per year` },
    {
      id: 'loanPayment',
      label: 'Loan payment',
      value: formatMoney(debtService.monthly),
      hint: debtService.monthly === 0 ? 'No loan' : sourceLabel(debtService.source),
    },
  ]
}

/** A cost row: shown as a deduction ("−$150.00") with where the number came from. */
function cost(label: string, line: MoneyLine): Metric {
  return { label, value: formatMoney(-line.monthly), hint: sourceLabel(line.source) }
}

/** The statement from rent down to cash flow, one row per line. All amounts are monthly. */
export function breakdownSection(result: CalculateResponse): MetricSection {
  const { income, expenses, noi, capex, debtService, cashFlow } = result
  return {
    title: 'Monthly income and expenses',
    description: 'Rent in, costs out. Each line shows where its number came from.',
    metrics: [
      { label: 'Gross rent', value: formatMoney(income.grossRent.monthly), hint: sourceLabel(income.grossRent.source) },
      cost('Vacancy', income.vacancy),
      { label: 'Effective rent', value: formatMoney(income.effectiveRent.monthly) },
      cost('Property tax', expenses.propertyTax),
      cost('Insurance', expenses.insurance),
      cost('HOA', expenses.hoa),
      cost('Utilities', expenses.utilities),
      cost('Maintenance', expenses.maintenance),
      cost('Management', expenses.management),
      { label: 'Net operating income', value: formatMoney(noi.monthly) },
      cost('CapEx reserve', capex),
      cost('Loan payment', debtService),
      { label: 'Cash flow', value: formatMoney(cashFlow.monthly), hint: `${formatMoney(cashFlow.annual)} per year` },
    ],
  }
}

function rate(assumption: AssumptionOut, notApplicable: string): Metric['value'] {
  return assumption.value === null ? notApplicable : percent.format(assumption.value)
}

/** The assumptions that produced the numbers, so nothing is hidden. */
export function assumptionsSection(result: CalculateResponse): MetricSection {
  const a = result.assumptions
  const row = (label: string, value: string, assumption: AssumptionOut, hint?: string): Metric => ({
    label,
    value,
    hint: hint ?? sourceLabel(assumption.source),
  })
  return {
    title: 'Assumptions used',
    description: 'These drive the numbers. You will be able to change them.',
    metrics: [
      row('Vacancy rate', rate(a.vacancyRate, '—'), a.vacancyRate),
      row('Maintenance (of rent)', rate(a.maintenanceRate, '—'), a.maintenanceRate),
      row('Management fee (of rent)', rate(a.managementRate, '—'), a.managementRate, `${sourceLabel(a.managementRate.source)}. Applies only with a property manager`),
      row('CapEx reserve (of rent)', rate(a.capexRate, '—'), a.capexRate),
      row('Interest rate', rate(a.interestRate, 'No loan'), a.interestRate),
      row(
        'Loan term',
        a.loanTermYears.value === null ? 'No loan' : `${a.loanTermYears.value} years`,
        a.loanTermYears,
      ),
      row('Utilities paid by you', `${formatMoney(a.monthlyUtilities.value ?? 0)} per month`, a.monthlyUtilities),
    ],
  }
}
