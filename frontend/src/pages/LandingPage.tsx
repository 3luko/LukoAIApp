import { PageContainer } from '../components/layout/PageContainer'
import { Wordmark } from '../components/layout/Wordmark'
import { Button, LinkButton } from '../components/ui/Button'
import { investorInfo } from '../data/investor'

/** Small, quiet, non-interactive corner labels. */
const cornerLabel = 'text-xs tracking-[0.2em] text-muted'

/**
 * Minimal landing page: one open composition. The large wordmark sits in the center and
 * fades in while drifting into place (CSS only, see `wordmark-enter` in index.css). Two
 * static labels balance the corners diagonally.
 */
export function LandingPage() {
  return (
    <PageContainer className="flex flex-1 flex-col justify-between gap-10 py-8 sm:py-10">
      <p className={`self-end ${cornerLabel}`}>PROPERTY INTELLIGENCE</p>

      <div className="flex flex-col items-center gap-10 text-center sm:gap-12">
        <h1>
          <Wordmark className="wordmark-enter text-6xl sm:text-8xl" />
        </h1>

        {/* The silver shimmer lives inside the letters (see `silver-shimmer` in index.css). */}
        <p className="silver-shimmer max-w-xl text-balance text-lg sm:text-xl">{investorInfo.tagline}</p>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row">
          <LinkButton to="/analyze" size="lg" viewTransition>
            Analyze a property
          </LinkButton>
          {/* Not built yet (see docs/todo.md). A real button, not a link: nothing to navigate to. */}
          <Button
            type="button"
            variant="secondary"
            size="lg"
            aria-disabled="true"
            aria-describedby="how-it-works-soon"
            className="pointer-events-none opacity-60"
          >
            How it works
            <span id="how-it-works-soon" className="text-xs font-normal text-muted">
              Coming soon
            </span>
          </Button>
        </div>
      </div>

      <p className={`self-start ${cornerLabel}`}>INTELLIGENCE IN OWNERSHIP</p>
    </PageContainer>
  )
}
