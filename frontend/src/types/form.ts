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

interface BasicData {
  address : string
  listPrice : number
  propertyType : string
  downPayment : number 
}


export interface HomebuyerFormValues extends BasicData {
  annualIncome : number
  monthlyDebts : number
  creditRange : string
  comfortableMonthlyPayments? : number
  duration : string
}


export interface InvestorFormValues extends BasicData{
  financing : string
  reserves : number
  expectedRent? : number
  management : string
  goal : string

}