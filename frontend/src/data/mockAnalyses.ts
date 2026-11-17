import type { Experience, MockAnalysis } from '../types/analysis'

/**
 * SAMPLE DATA ONLY. Hand-written placeholder values for layout purposes.
 * Nothing here is calculated, and none of it is a real recommendation.
 */

const sampleProperty = {
  address: '123 Maple St, Austin, TX 78704',
  listPrice: '$425,000',
  propertyType: 'Single-family',
  beds: 3,
  baths: 2,
  sqft: '1,640',
  yearBuilt: 1998,
}

export const mockAnalyses: Record<Experience, MockAnalysis> = {
  homebuyer: {
    experience: 'homebuyer',
    property: sampleProperty,
    summary:
      'Sample summary: this is where LukoAI will explain, in plain language, how this home fits your budget, what your monthly costs would look like, and what to watch out for.',
    keyMetrics: [
      { label: 'Est. monthly cost', value: '$2,860', hint: 'Mortgage, taxes, insurance, PMI' },
      { label: 'Share of income', value: '36%', hint: 'Of gross monthly income', tone: 'caution' },
      { label: 'Cash needed to close', value: '$48,200', hint: 'Down payment + closing costs' },
      { label: 'Emergency cushion', value: '4.1 mo', hint: 'Savings left after closing', tone: 'positive' },
    ],
    sections: [
      {
        title: 'Monthly cost breakdown',
        description: 'Where your monthly payment would go.',
        metrics: [
          { label: 'Principal & interest', value: '$2,170' },
          { label: 'Property tax', value: '$420' },
          { label: 'Homeowners insurance', value: '$145' },
          { label: 'PMI', value: '$125' },
        ],
      },
      {
        title: 'Loan snapshot',
        metrics: [
          { label: 'Loan amount', value: '$382,500' },
          { label: 'Interest rate (sample)', value: '5.5%' },
          { label: 'Term', value: '30 years' },
          { label: 'Down payment', value: '10%' },
        ],
      },
    ],
    risks: [
      { title: 'Payment near your stated comfort limit', detail: 'Sample risk: little room for rate or tax increases.', severity: 'medium' },
      { title: 'Older roof and HVAC', detail: 'Sample risk: budget for near-term maintenance on a 1998 home.', severity: 'medium' },
      { title: 'Property tax reassessment', detail: 'Sample risk: taxes may rise after purchase.', severity: 'low' },
    ],
    nextSteps: [
      'Get a mortgage pre-approval to confirm your actual rate.',
      'Request the seller’s disclosure and recent utility bills.',
      'Budget for a home inspection before making an offer.',
    ],
  },
  investor: {
    experience: 'investor',
    property: sampleProperty,
    summary:
      'Sample summary: this is where LukoAI will explain the property’s income potential, expected expenses, and the main risks to your returns.',
    keyMetrics: [
      { label: 'Est. monthly rent', value: '$2,600', hint: 'Market estimate' },
      { label: 'Est. monthly cash flow', value: '−$140', hint: 'After all expenses', tone: 'negative' },
      { label: 'Cap rate', value: '5.2%', hint: 'Net operating income / price' },
      { label: 'Cash-on-cash return', value: '−1.7%', hint: 'Year one', tone: 'caution' },
    ],
    sections: [
      {
        title: 'Monthly income & expenses',
        description: 'Expected monthly money in and money out.',
        metrics: [
          { label: 'Gross rent', value: '$2,600' },
          { label: 'Vacancy allowance', value: '−$130' },
          { label: 'Operating expenses', value: '−$630' },
          { label: 'Debt service', value: '−$1,980' },
        ],
      },
      {
        title: 'Investment snapshot',
        metrics: [
          { label: 'Total cash invested', value: '$97,400' },
          { label: 'Net operating income (annual)', value: '$22,080' },
          { label: 'DSCR', value: '0.93' },
          { label: 'Break-even rent', value: '$2,750' },
        ],
      },
    ],
    risks: [
      { title: 'Negative cash flow at current rent', detail: 'Sample risk: relies on rent growth or appreciation.', severity: 'high' },
      { title: 'Thin cash reserves', detail: 'Sample risk: one major repair could strain reserves.', severity: 'medium' },
      { title: 'Rising local supply', detail: 'Sample risk: new rentals nearby may pressure rents.', severity: 'low' },
    ],
    nextSteps: [
      'Compare rent estimates against three nearby rental listings.',
      'Get insurance and property-management quotes.',
      'Model a scenario with a larger down payment.',
    ],
  },
}
