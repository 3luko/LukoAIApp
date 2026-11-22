import type { ExperienceInfo } from '../../types/analysis'
import { LinkButton } from '../ui/Button'
import { Card } from '../ui/Card'
import { ArrowRightIcon, ChartIcon, CheckIcon } from '../ui/icons'

interface ExperienceCardProps {
  experience: ExperienceInfo
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-control border border-border bg-accent-soft text-fg">
          <ChartIcon width={22} height={22} />
        </span>
        <div>
          <h3 className="text-lg font-semibold">{experience.name}</h3>
          <p className="text-sm text-muted">{experience.audience}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-medium">{experience.tagline}</p>
        <p className="font-sans text-sm leading-relaxed text-muted">{experience.description}</p>
      </div>

      <ul className="space-y-2 text-sm">
        {experience.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckIcon width={18} height={18} className="mt-px shrink-0 text-muted" />
            {item}
          </li>
        ))}
      </ul>

      <LinkButton to="/analyze" className="mt-auto w-full">
        Analyze a property
        <ArrowRightIcon width={16} height={16} />
      </LinkButton>
    </Card>
  )
}
