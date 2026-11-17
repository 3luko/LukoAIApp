import type { Experience } from '../types/analysis'
import type { FieldGroup } from '../types/form'

/** Placeholder inputs. Final fields depend on the business logic and API design. */

const propertyGroup: FieldGroup = {
  title: 'Property',
  description: 'Which property are you looking at?',
  fields: [
    { id: 'address', label: 'Property address', type: 'text', placeholder: '123 Maple St, Austin, TX' },
    { id: 'listPrice', label: 'Listing price', type: 'number', prefix: '$', placeholder: '425,000', optional: true, hint: 'Leave blank to use the listing data.' },
    {
      id: 'propertyType',
      label: 'Property type',
      type: 'select',
      options: [
        { value: 'single-family', label: 'Single-family' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'multi-family', label: 'Multi-family (2–4 units)' },
      ],
    },
  ],
}

export const formGroups: Record<Experience, FieldGroup[]> = {
  homebuyer: [
    propertyGroup,
    {
      title: 'Your finances',
      description: 'Rough numbers are fine. These help us estimate affordability.',
      fields: [
        { id: 'annualIncome', label: 'Annual household income', type: 'number', prefix: '$', placeholder: '95,000' },
        { id: 'monthlyDebts', label: 'Monthly debt payments', type: 'number', prefix: '$', placeholder: '450', hint: 'Car, student loans, credit cards.' },
        { id: 'downPayment', label: 'Savings for down payment', type: 'number', prefix: '$', placeholder: '40,000' },
        {
          id: 'creditRange',
          label: 'Credit score range',
          type: 'select',
          options: [
            { value: 'excellent', label: 'Excellent (760+)' },
            { value: 'good', label: 'Good (700–759)' },
            { value: 'fair', label: 'Fair (640–699)' },
            { value: 'building', label: 'Building (below 640)' },
          ],
        },
      ],
    },
    {
      title: 'Your preferences',
      fields: [
        { id: 'targetPayment', label: 'Comfortable monthly payment', type: 'number', prefix: '$', placeholder: '2,300', optional: true },
        {
          id: 'timeline',
          label: 'How long do you plan to stay?',
          type: 'select',
          options: [
            { value: 'short', label: 'Under 3 years' },
            { value: 'medium', label: '3–7 years' },
            { value: 'long', label: '7+ years' },
          ],
        },
      ],
    },
  ],
  investor: [
    propertyGroup,
    {
      title: 'Financing',
      description: 'How you plan to pay for the property.',
      fields: [
        { id: 'downPayment', label: 'Down payment', type: 'number', prefix: '$', placeholder: '85,000' },
        {
          id: 'financing',
          label: 'Financing type',
          type: 'select',
          options: [
            { value: 'conventional', label: 'Conventional loan' },
            { value: 'fha', label: 'FHA (owner-occupied)' },
            { value: 'dscr', label: 'DSCR loan' },
            { value: 'cash', label: 'All cash' },
          ],
        },
        { id: 'reserves', label: 'Cash reserves after purchase', type: 'number', prefix: '$', placeholder: '15,000' },
      ],
    },
    {
      title: 'Rental plan',
      fields: [
        { id: 'expectedRent', label: 'Expected monthly rent', type: 'number', prefix: '$', placeholder: '2,600', optional: true, hint: 'Leave blank to use a market estimate.' },
        {
          id: 'goal',
          label: 'Primary goal',
          type: 'select',
          options: [
            { value: 'cash-flow', label: 'Monthly cash flow' },
            { value: 'appreciation', label: 'Long-term appreciation' },
            { value: 'balanced', label: 'Balanced' },
          ],
        },
        {
          id: 'management',
          label: 'Management',
          type: 'select',
          options: [
            { value: 'self', label: 'Self-managed' },
            { value: 'manager', label: 'Property manager' },
          ],
        },
      ],
    },
  ],
}
