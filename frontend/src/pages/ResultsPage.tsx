import { useParams } from 'react-router'
import { ExperienceSwitcher } from '../components/analysis/ExperienceSwitcher'
import { MetricGrid } from '../components/analysis/MetricGrid'
import { MetricSectionCard } from '../components/analysis/MetricSectionCard'
import { MockDataBanner } from '../components/analysis/MockDataBanner'
import { PropertySummaryCard } from '../components/analysis/PropertySummaryCard'
import { RiskList } from '../components/analysis/RiskList'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { experiences, isExperience } from '../data/experiences'
import { mockAnalyses } from '../data/mockAnalyses'
import { NotFoundPage } from './NotFoundPage'

export function ResultsPage() {
  const { experience } = useParams()
  if (!isExperience(experience)) return <NotFoundPage />

  const info = experiences[experience]
  // Mock data for now. Later this comes from the backend API.
  const analysis = mockAnalyses[experience]

  return (
    <PageContainer className="space-y-6 py-10 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading as="h1" eyebrow={`${info.name} results`} title="Property analysis" />
        <ExperienceSwitcher basePath="/results" />
      </div>

      <MockDataBanner />
      <PropertySummaryCard property={analysis.property} />

      <Card>
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-2 text-muted">{analysis.summary}</p>
      </Card>

      <section aria-label="Key metrics">
        <MetricGrid metrics={analysis.keyMetrics} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {analysis.sections.map((section) => (
          <MetricSectionCard key={section.title} section={section} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RiskList risks={analysis.risks} />
        <Card>
          <h3 className="font-semibold">Suggested next steps</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted marker:text-accent">
            {analysis.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <LinkButton to={`/analyze/${experience}`} variant="secondary">
          Edit inputs
        </LinkButton>
        <LinkButton to="/" variant="ghost">
          Back to home
        </LinkButton>
      </div>
    </PageContainer>
  )
}
