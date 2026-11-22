interface SectionHeadingProps {
  title: string
  description?: string
  eyebrow?: string
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeading({ title, description, eyebrow, as: Tag = 'h2' }: SectionHeadingProps) {
  const size = Tag === 'h1' ? 'text-3xl sm:text-4xl' : Tag === 'h2' ? 'text-xl sm:text-2xl' : 'text-lg'
  return (
    <div className="space-y-1.5">
      {eyebrow && <p className="text-xs font-medium uppercase tracking-wider text-muted">{eyebrow}</p>}
      <Tag className={`font-semibold tracking-tight ${size}`}>{title}</Tag>
      {description && <p className="max-w-2xl font-sans leading-relaxed text-muted">{description}</p>}
    </div>
  )
}
