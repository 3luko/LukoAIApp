import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageContainer } from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { SectionHeading } from '../components/ui/SectionHeading'
import { investorFormGroups } from '../data/formFields'
import { investorInfo } from '../data/investor'
import type { InvestorFormValues } from '../types/form'
import { parseAmount, validateInvestorForm } from '../lib/validateInvestorForm'


export function AnalyzePage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<string, string>>({})

  


  // Price and rent are required: the analysis can't run without them.
  const canSubmit = Boolean(values.listPrice?.trim()) && Boolean(values.expectedRent?.trim())

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO(you): Validate `values`, convert them to InvestorFormValues (numbers, not strings),
    const raw = values;


    const errors = validateInvestorForm(raw)
    if (Object.keys(errors).length > 0) {
      console.log('Form errors:', errors)
      return
    }

    const parsed : InvestorFormValues = {
      address : raw.address,
      downPayment : parseAmount(raw.downPayment),
      expectedRent: parseAmount(raw.expectedRent),
      financing : raw.financing,
      goal : raw.goal,
      listPrice: parseAmount(raw.listPrice),
      management : raw.management,
      propertyType : raw.propertyType,
      reserves : parseAmount(raw.reserves)
    }

    // and pass them to the results page (hint: think about where this state should live).
    navigate('/results', { state : parsed })
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <SectionHeading
        as="h1"
        eyebrow={`${investorInfo.name} analysis`}
        title={investorInfo.tagline}
        description={investorInfo.description}
      />

      <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
        {investorFormGroups.map((group) => (
          <Card key={group.title}>
            <fieldset>
              <legend className="font-semibold">{group.title}</legend>
              {group.description && <p className="mt-1 text-sm text-muted">{group.description}</p>}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <FormField
                    key={field.id}
                    field={field}
                    value={values[field.id] ?? ''}
                    onChange={handleChange}
                  />
                ))}
              </div>
            </fieldset>
          </Card>
        ))}

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id="submit-help" className="text-sm text-muted">
            {canSubmit
              ? 'Inputs aren’t saved or analyzed yet. You’ll see sample results.'
              : 'Enter the listing price and expected monthly rent to continue.'}
          </p>
          <Button type="submit" size="lg" disabled={!canSubmit} aria-describedby="submit-help">
            View sample analysis
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
