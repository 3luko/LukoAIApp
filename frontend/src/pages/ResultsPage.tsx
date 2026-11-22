import { Navigate, useLocation } from 'react-router'
import { CalculationResults } from '../components/analysis/CalculationResults'
import { InputSummaryCard } from '../components/analysis/InputSummaryCard'
import { MockDataBanner } from '../components/analysis/MockDataBanner'
import { RiskList } from '../components/analysis/RiskList'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { investorInfo } from '../data/investor'
import { mockInvestorAnalysis } from '../data/mockAnalyses'
import { useAnalysis } from '../hooks/useAnalysis'
import { isInvestorFormValues } from '../lib/validateInvestorForm'
import type { InvestorFormValues } from '../types/form'

export function ResultsPage() {
  // The analyze form passes its validated values here as router state. They're missing when
  // the page is opened directly (typed URL, new tab), and anyone can edit history state, so
  // check the shape before using it.
  const state: unknown = useLocation().state
  if (!isInvestorFormValues(state)) return <Navigate to="/analyze" replace />

  return <Results inputs={state} />
}

function Results({ inputs }: { inputs: InvestorFormValues }) {
  const { status, data, error, retry } = useAnalysis(inputs)

  // Summary, risks and next steps are still sample content (the written summary comes later).
  const sample = mockInvestorAnalysis

  return (
    <PageContainer className="space-y-6 py-10 sm:py-14">
      <SectionHeading as="h1" eyebrow={`${investorInfo.name} results`} title="Property analysis" />

      <InputSummaryCard inputs={inputs} />
      <CalculationResults status={status} data={data} error={error} onRetry={retry} />

      <MockDataBanner />

      <Card>
        <h2 className="font-semibold">Summary</h2>
        <p className="mt-2 max-w-3xl font-sans leading-relaxed text-muted">{sample.summary}</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RiskList risks={sample.risks} />
        <Card>
          <h3 className="font-semibold">Suggested next steps</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted marker:text-subtle">
            {sample.nextSteps.map((step) => (
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
