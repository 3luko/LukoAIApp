import { ExperienceCard } from '../components/analysis/ExperienceCard'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { investorInfo } from '../data/investor'

const steps = [
  { title: 'Enter the property', body: 'The address, listing price, and property type you are considering.' },
  { title: 'Add rent and financing', body: 'Your down payment, financing type, reserves, and expected rent.' },
  { title: 'Get a clear analysis', body: 'Cash flow, return indicators, and risks, explained in plain language.' },
]

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-80 max-w-3xl rounded-full bg-accent/20 blur-3xl"
        />
        <PageContainer className="relative py-20 text-center sm:py-28">
          <p className="mx-auto mb-5 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            Real estate ownership intelligence
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Own smarter. <span className="text-accent">Decide with confidence.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            LukoAI helps first-time property investors understand what a rental property really earns, costs, and
            risks before they commit capital.
          </p>
          <div className="mt-8 flex justify-center">
            <LinkButton to="/analyze" size="lg">
              Analyze a property
            </LinkButton>
          </div>
        </PageContainer>
      </section>

      {/* Experience */}
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Built for investors"
          title="See the numbers behind a rental"
          description="LukoAI focuses on the questions first-time investors ask: will this property pay for itself, and what could go wrong?"
        />
        <div className="mt-8 max-w-xl">
          <ExperienceCard experience={investorInfo} />
        </div>
      </PageContainer>

      {/* How it works */}
      <PageContainer>
        <SectionHeading eyebrow="How it works" title="Three steps to a clearer decision" />
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
              <span className="grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <p className="mt-4 font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </PageContainer>
    </>
  )
}
