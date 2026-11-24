import { investorFormGroups } from '../../data/formFields'
import type { InvestorFormValues } from '../../types/form'
import { Card } from '../ui/Card'

interface InputSummaryCardProps {
  inputs: InvestorFormValues
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

/** Turns a stored option value (e.g. "single-family") into its label ("Single-family"). */
function optionLabel(fieldId: string, value: string): string {
  const field = investorFormGroups.flatMap((group) => group.fields).find((f) => f.id === fieldId)
  return field?.options?.find((option) => option.value === value)?.label ?? value
}

/** Shows the values the user submitted on the analyze form. */
export function InputSummaryCard({ inputs }: InputSummaryCardProps) {
  const rows = [
    { label: 'Property', value: inputs.address },
    { label: 'Listing price', value: formatCurrency(inputs.listPrice) },
    { label: 'Property type', value: optionLabel('propertyType', inputs.propertyType) },
    { label: 'Year built', value: String(inputs.yearBuilt) },
    { label: 'Property tax', value: `${formatCurrency(inputs.annualPropertyTax)} / year` },
    { label: 'Insurance', value: `${formatCurrency(inputs.annualInsurance)} / year` },
    { label: 'HOA', value: `${formatCurrency(inputs.monthlyHoa)} / month` },
    { label: 'Down payment', value: formatCurrency(inputs.downPayment) },
    { label: 'Financing', value: optionLabel('financing', inputs.financing) },
    { label: 'Cash reserves', value: formatCurrency(inputs.reserves) },
    { label: 'Expected rent', value: formatCurrency(inputs.expectedRent) },
    { label: 'Management', value: optionLabel('management', inputs.management) },
    { label: 'Primary goal', value: optionLabel('goal', inputs.goal) },
  ]

  return (
    <Card>
      <h2 className="font-semibold">Your inputs</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs uppercase tracking-wide text-muted">{row.label}</dt>
            <dd className="font-semibold tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
