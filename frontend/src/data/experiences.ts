import type { Experience, ExperienceInfo } from '../types/analysis'

export const experiences: Record<Experience, ExperienceInfo> = {
  homebuyer: {
    id: 'homebuyer',
    name: 'Homebuyer',
    audience: 'First-time homebuyers',
    tagline: 'Can I comfortably own this home?',
    description:
      'Understand the true monthly cost of a home you plan to live in, how it fits your budget, and what could catch you off guard.',
    highlights: [
      'True monthly cost of ownership',
      'Affordability against your budget',
      'Risks and hidden costs to watch for',
    ],
  },
  investor: {
    id: 'investor',
    name: 'Investor',
    audience: 'First-time property investors',
    tagline: 'Is this property a sound investment?',
    description:
      'Evaluate a rental property’s income potential, expenses, and risk before you commit capital.',
    highlights: [
      'Rental income and expense outlook',
      'Cash flow and return indicators',
      'Market and vacancy risk factors',
    ],
  },
}

export const experienceList = Object.values(experiences)

export function isExperience(value: string | undefined): value is Experience {
  return value === 'homebuyer' || value === 'investor'
}
