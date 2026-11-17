/**
 * Placeholder shapes for the UI. These are display-ready strings, not computed values.
 * When the FastAPI backend exists, these types should mirror its response schema.
 */

/** Visual tone only; it does not encode any financial judgement. */
export type Tone = 'neutral' | 'positive' | 'caution' | 'negative'

export interface Metric {
  label: string
  value: string
  hint?: string
  tone?: Tone
}

export interface MetricSection {
  title: string
  description?: string
  metrics: Metric[]
}

export interface RiskItem {
  title: string
  detail: string
  severity: 'low' | 'medium' | 'high'
}

export interface PropertySummary {
  address: string
  listPrice: string
  propertyType: string
  beds: number
  baths: number
  sqft: string
  yearBuilt: number
}

export interface MockAnalysis {
  property: PropertySummary
  summary: string
  keyMetrics: Metric[]
  sections: MetricSection[]
  risks: RiskItem[]
  nextSteps: string[]
}

/** Landing-page copy describing the investor experience. */
export interface ExperienceInfo {
  name: string
  audience: string
  tagline: string
  description: string
  highlights: string[]
}
