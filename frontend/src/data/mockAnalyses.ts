import type { MockAnalysis } from '../types/analysis'

/**
 * SAMPLE DATA ONLY. Hand-written placeholder values for layout purposes.
 * Nothing here is calculated, and none of it is a real recommendation.
 */

export const mockInvestorAnalysis: MockAnalysis = {
  property: {
    address: '123 Maple St, Austin, TX 78704',
    listPrice: '$425,000',
    propertyType: 'Single-family',
    beds: 3,
    baths: 2,
    sqft: '1,640',
    yearBuilt: 1998,
  },
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
}
