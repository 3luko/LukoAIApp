import { NavLink } from 'react-router'
import { experienceList } from '../../data/experiences'

interface ExperienceSwitcherProps {
  /** Route prefix, e.g. "/analyze" or "/results". */
  basePath: string
}

/** Segmented control for switching between the Homebuyer and Investor experiences. */
export function ExperienceSwitcher({ basePath }: ExperienceSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-surface p-1" role="group" aria-label="Experience">
      {experienceList.map((exp) => (
        <NavLink
          key={exp.id}
          to={`${basePath}/${exp.id}`}
          className={({ isActive }) =>
            `rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'
            }`
          }
        >
          {exp.name}
        </NavLink>
      ))}
    </div>
  )
}
