import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-8' : 'px-8 py-16'}`}
    >
      {Icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-charcoal-700 bg-charcoal-850 text-sage-300">
          <Icon size={18} strokeWidth={1.6} />
        </div>
      ) : null}
      <h3 className="font-serif text-lg text-parchment-100">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-parchment-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
