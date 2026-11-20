import type { ReactNode } from 'react'

type Tone = 'neutral' | 'positive' | 'warning' | 'negative'

const tones: Record<Tone, string> = {
  neutral: 'border-charcoal-700 bg-charcoal-850 text-parchment-300',
  positive: 'border-sage-600/50 bg-sage-600/15 text-sage-200',
  warning: 'border-amber-800/60 bg-amber-950/30 text-amber-200',
  negative: 'border-red-900/60 bg-red-950/30 text-red-200',
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
