import { Navigate, useLocation } from 'react-router'
import { InputSummaryCard } from '../components/analysis/InputSummaryCard'
import { MetricGrid } from '../components/analysis/MetricGrid'
import { MetricSectionCard } from '../components/analysis/MetricSectionCard'
import { MockDataBanner } from '../components/analysis/MockDataBanner'
import { RiskList } from '../components/analysis/RiskList'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { investorInfo } from '../data/investor'
import { mockInvestorAnalysis } from '../data/mockAnalyses'
import type { InvestorFormValues } from '../types/form'

export function ResultsPage() {
  // The analyze form passes its validated values here as router state.
  // They're missing when the page is opened directly (shared link, typed URL, new tab).
  const location = useLocation()
  const inputs = location.state as InvestorFormValues | null

  if (!inputs) return <Navigate to="/analyze" replace />

  // Mock metrics for now. Later these are calculated from `inputs` by the backend.
  const analysis = mockInvestorAnalysis
  return (
    <PageContainer className="space-y-6 py-10 sm:py-14">
      <SectionHeading as="h1" eyebrow={`${investorInfo.name} results`} title="Property analysis" />

      <MockDataBanner />
      <InputSummaryCard inputs={inputs} />

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
        <LinkButton to="/analyze" variant="secondary">
          Edit inputs
        </LinkButton>
        <LinkButton to="/" variant="ghost">
          Back to home
        </LinkButton>
      </div>
    </PageContainer>
  )
}
