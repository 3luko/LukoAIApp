import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { AnalyzePage } from '../pages/AnalyzePage'
import { LandingPage } from '../pages/LandingPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ResultsPage } from '../pages/ResultsPage'

/** All routes render inside AppLayout (header + footer). */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/analyze', element: <AnalyzePage /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
