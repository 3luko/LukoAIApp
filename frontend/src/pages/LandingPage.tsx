import { ExperienceCard } from '../components/analysis/ExperienceCard'
import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { experienceList } from '../data/experiences'

const steps = [
  { title: 'Choose your path', body: 'Buying a home to live in, or evaluating a rental investment.' },
  { title: 'Share a few details', body: 'A property address and a rough picture of your finances and goals.' },
  { title: 'Get a clear analysis', body: 'Costs, key numbers, and risks, explained in plain language.' },
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
            LukoAI helps first-time homebuyers and first-time investors understand what a property really costs
            and what risks come with it, before they commit.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton to="/analyze/homebuyer" size="lg">
              I’m buying a home
            </LinkButton>
            <LinkButton to="/analyze/investor" size="lg" variant="secondary">
              I’m evaluating an investment
            </LinkButton>
          </div>
        </PageContainer>
      </section>

      {/* Experiences */}
      <PageContainer className="py-16 sm:py-20">
        <SectionHeading
          eyebrow="Two experiences"
          title="Built for where you are"
          description="Buying a home to live in and buying a property to rent are different decisions, so LukoAI analyzes them differently."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {experienceList.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
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
