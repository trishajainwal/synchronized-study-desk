import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../components/common/EmptyState'
import { UnavailableBanner } from '../components/common/UnavailableBanner'

export function ReportSection() {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="subtle-label">Progress</p>
      <h2 className="mt-2 font-serif text-2xl text-parchment-100">Reports</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-parchment-400">
        Study reports are not generated in this milestone. The interface reserves a place for
        evidence-backed progress summaries without inventing results.
      </p>

      <div className="mt-7">
        <UnavailableBanner
          title="Study reports unavailable"
          detail="POST /api/study-reports/generate currently returns 501. No report data is fabricated or displayed."
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {['Reading progress', 'Quiz performance', 'Evidence index'].map((label) => (
          <div
            key={label}
            className="rounded-lg border border-charcoal-700/70 bg-charcoal-900/60 px-5 py-4"
          >
            <p className="text-xs font-medium text-parchment-200">{label}</p>
            <p className="mt-2 text-2xl font-serif text-parchment-400">—</p>
            <p className="mt-1 text-[11px] text-parchment-400">Awaiting backend implementation</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-charcoal-700 bg-charcoal-950/40">
        <EmptyState
          compact
          icon={BarChart3}
          title="No report generated"
          description="Generate a report from a completed study session once the endpoint is implemented."
        />
      </div>
    </div>
  )
}
