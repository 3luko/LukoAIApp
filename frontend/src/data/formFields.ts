import type { FieldGroup } from '../types/form'

/** Placeholder inputs for the investor analysis. Final fields depend on the business logic and API design. */

export const investorFormGroups: FieldGroup[] = [
  {
    title: 'Property',
    description: 'Which property are you looking at?',
    fields: [
      { id: 'address', label: 'Property address', type: 'text', placeholder: '123 Maple St, Austin, TX' },
      { id: 'listPrice', label: 'Listing price', type: 'number', prefix: '$', placeholder: '425,000' },
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
  },
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
      { id: 'expectedRent', label: 'Expected monthly rent', type: 'number', prefix: '$', placeholder: '2,600', hint: 'What you expect to charge per month.' },
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
]
