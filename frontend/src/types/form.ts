/** Declarative description of a form input, so forms can be rendered from config. */
export interface FieldOption {
  value: string
  label: string
}

export interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'select'
  placeholder?: string
  hint?: string
  prefix?: string
  suffix?: string
  options?: FieldOption[]
  optional?: boolean
}

export interface FieldGroup {
  title: string
  description?: string
  fields: FieldDef[]
}

/** The submitted investor form. Field names match the ids in data/formFields.ts. */
export interface InvestorFormValues {
  address: string
  listPrice: number
  propertyType: string
  yearBuilt: number
  annualPropertyTax: number
  annualInsurance: number
  /** Monthly HOA fee. 0 when there is none. */
  monthlyHoa: number
  downPayment: number
  financing: string
  reserves: number
  expectedRent: number
  management: string
  goal: string
}