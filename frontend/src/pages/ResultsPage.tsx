import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { CalculationResults } from '../components/analysis/CalculationResults'
import { InputSummaryCard } from '../components/analysis/InputSummaryCard'
import type { AssumptionEditing } from '../components/analysis/InteractiveMetricGrid'
import { MockDataBanner } from '../components/analysis/MockDataBanner'
import { RiskList } from '../components/analysis/RiskList'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SectionHeading } from '../components/ui/SectionHeading'
import { investorInfo } from '../data/investor'
import { mockInvestorAnalysis } from '../data/mockAnalyses'
import { useAnalysis } from '../hooks/useAnalysis'
import type { AssumptionKey } from '../lib/assumptionFields'
import { isInvestorFormValues } from '../lib/validateInvestorForm'
import type { AssumptionsInput } from '../types/calculate'
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
  // The investor's changes to the assumptions. They live here, in component state, and are
  // sent with every calculation (see docs/decisions/0002). Absent means "use the default".
  const [overrides, setOverrides] = useState<AssumptionsInput>({})
  const [resetVersion, setResetVersion] = useState(0)
  const { status, data, error, baseline, retry } = useAnalysis(inputs, overrides)

  function changeOverride(key: AssumptionKey, value: number | undefined) {
    setOverrides((previous) => {
      const next = { ...previous }
      if (value === undefined) delete next[key]
      else next[key] = value
      return next
    })
  }

  function resetOverrides(keys: AssumptionKey[]) {
    setOverrides((previous) => {
      const next = { ...previous }
      for (const key of keys) delete next[key]
      return next
    })
    setResetVersion((version) => version + 1)
  }

  const editing: AssumptionEditing = {
    overrides,
    baseline: baseline?.assumptions ?? null,
    // Factors that can't change anything for this property are shown but locked.
    disabled: {
      ...(inputs.management === 'self' && { managementRate: 'Applies only if you use a property manager.' }),
      ...(inputs.financing === 'cash' && {
        interestRate: 'No loan: this is an all-cash purchase.',
        loanTermYears: 'No loan: this is an all-cash purchase.',
      }),
    },
    resetVersion,
    onChange: changeOverride,
    onReset: resetOverrides,
  }

  // Summary, risks and next steps are still sample content (the written summary comes later).
  const sample = mockInvestorAnalysis

  return (
    <PageContainer className="space-y-6 py-10 sm:py-14">
      <SectionHeading as="h1" eyebrow={`${investorInfo.name} results`} title="Property analysis" />

      <InputSummaryCard inputs={inputs} />
      <CalculationResults
        status={status}
        data={data}
        error={error}
        onRetry={retry}
        editing={editing}
        onResetAll={() => resetOverrides(Object.keys(overrides) as AssumptionKey[])}
      />

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
