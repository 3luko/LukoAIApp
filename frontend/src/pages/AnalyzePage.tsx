import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ExperienceSwitcher } from '../components/analysis/ExperienceSwitcher'
import { PageContainer } from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FormField } from '../components/ui/FormField'
import { SectionHeading } from '../components/ui/SectionHeading'
import { experiences, isExperience } from '../data/experiences'
import { formGroups } from '../data/formFields'
import { NotFoundPage } from './NotFoundPage'
import { useState } from 'react'



export function AnalyzePage() {

  const { experience } = useParams()
  const navigate = useNavigate()

  const [values,  setValues] = useState<Record<string, string>>({});

  

  if (!isExperience(experience)) return <NotFoundPage />

  const info = experiences[experience]



  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO(you): Turn these inputs into typed, controlled form state, validate it,
    // and pass the values to the results page (hint: think about where this state should live).

    
    navigate(`/results/${experience}`)
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          as="h1"
          eyebrow={`${info.name} analysis`}
          title={info.tagline}
          description={info.description}
        />
        <ExperienceSwitcher basePath="/analyze" />
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
        {formGroups[experience].map((group) => (
          <Card key={group.title}>
            <fieldset>
              <legend className="font-semibold">{group.title}</legend>
              {group.description && <p className="mt-1 text-sm text-muted">{group.description}</p>}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <FormField key={field.id} field={field} />
                ))}
              </div>
            </fieldset>
          </Card>
        ))}

        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Inputs aren’t saved or analyzed yet. You’ll see sample results.</p>
          <Button type="submit" size="lg">
            View sample analysis
          </Button>
        </div>
      </form>
    </PageContainer>
  )
}
