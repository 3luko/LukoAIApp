/**
 * Types for POST /analysis/calculate. They mirror the backend schemas in
 * backend/app/schemas/analysis.py and the contract in docs/api/analysis-calculate.md.
 * Keep them in sync by hand when the contract changes.
 */

export type Financing = 'conventional' | 'dscr' | 'cash'
export type Management = 'self' | 'manager'

/** Where a number came from. `missing` means no data: counted as 0 and should be flagged. */
export type Source = 'investor' | 'default' | 'estimate' | 'missing'

// --- request -----------------------------------------------------------------

export interface PropertyInput {
  price: number
  yearBuilt?: number
  annualPropertyTax?: number
  annualInsurance?: number
  monthlyHoa?: number
}

export interface InvestorInput {
  downPayment: number
  financing: Financing
  monthlyRent: number
  management: Management
}

/** Optional overrides. Leave a field out to use the default. */
export interface AssumptionsInput {
  vacancyRate?: number
  maintenanceRate?: number
  managementRate?: number
  capexRate?: number
  interestRate?: number
  loanTermYears?: number
  monthlyUtilities?: number
}

export interface CalculateRequest {
  property: PropertyInput
  investor: InvestorInput
  assumptions?: AssumptionsInput
}

// --- response ----------------------------------------------------------------

export interface MoneyAmount {
  monthly: number
  annual: number
}

export interface MoneyLine extends MoneyAmount {
  source: Source
}

export interface AssumptionOut {
  /** null when it doesn't apply (interest rate and term for an all-cash purchase). */
  value: number | null
  source: Source
}

export interface CalculateResponse {
  income: {
    grossRent: MoneyLine
    vacancy: MoneyLine
    effectiveRent: MoneyAmount
  }
  expenses: {
    propertyTax: MoneyLine
    insurance: MoneyLine
    hoa: MoneyLine
    utilities: MoneyLine
    maintenance: MoneyLine
    management: MoneyLine
    total: MoneyAmount
  }
  noi: MoneyAmount
  capex: MoneyLine
  debtService: MoneyLine
  cashFlow: MoneyAmount
  assumptions: {
    vacancyRate: AssumptionOut
    maintenanceRate: AssumptionOut
    managementRate: AssumptionOut
    capexRate: AssumptionOut
    interestRate: AssumptionOut
    loanTermYears: AssumptionOut
    monthlyUtilities: AssumptionOut
  }
  warnings: string[]
}
