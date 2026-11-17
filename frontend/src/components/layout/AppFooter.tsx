import { PageContainer } from './PageContainer'

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-border py-8 text-sm text-muted">
      <PageContainer className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} LukoAI. Own smarter. Decide with confidence.</p>
        <p>For educational purposes only. Not financial advice.</p>
      </PageContainer>
    </footer>
  )
}
