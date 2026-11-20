import { Construction } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export function UnavailableBanner({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3">
      <Construction size={16} className="mt-0.5 shrink-0 text-amber-300" />
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-amber-100">{title}</p>
          <StatusBadge tone="warning">501</StatusBadge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-amber-100/70">{detail}</p>
      </div>
    </div>
  )
}
