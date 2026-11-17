import { PageContainer } from '../components/layout/PageContainer'
import { LinkButton } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <PageContainer className="py-24 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">The page you’re looking for doesn’t exist.</p>
      <LinkButton to="/" className="mt-8">
        Back to home
      </LinkButton>
    </PageContainer>
  )
}
