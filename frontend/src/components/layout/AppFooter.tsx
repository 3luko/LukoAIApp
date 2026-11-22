import { investorInfo } from '../../data/investor'
import { PageContainer } from './PageContainer'

interface AppFooterProps {
  /** Landing page: no divider line, and only the disclaimer (the tagline is already on the page). */
  bare?: boolean
}

export function AppFooter({ bare = false }: AppFooterProps) {
  if (bare) {
    return (
      <footer className="py-6 text-center text-xs text-muted">
        <PageContainer>
          <p>For educational purposes only. Not financial advice.</p>
        </PageContainer>
      </footer>
    )
  }

  return (
    <footer className="mt-16 border-t border-border py-8 text-sm text-muted">
      <PageContainer className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>
        {/* {new Date().getFullYear()}  */}
        LukoAI. {investorInfo.tagline}
        </p>
        <p>For educational purposes only. Not financial advice.</p>
      </PageContainer>
    </footer>
  )
}
