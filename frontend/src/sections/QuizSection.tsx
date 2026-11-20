import { ListChecks } from 'lucide-react'
import { EmptyState } from '../components/common/EmptyState'
import { UnavailableBanner } from '../components/common/UnavailableBanner'
import type { DocumentRead } from '../types/document'

export function QuizSection({ documents }: { documents: DocumentRead[] }) {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <p className="subtle-label">Assessment</p>
      <h2 className="mt-2 font-serif text-2xl text-parchment-100">Quizzes</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-parchment-400">
        Quiz generation and evaluation are part of the backend contract, but the handlers are not
        implemented in this milestone.
      </p>

      <div className="mt-7">
        <UnavailableBanner
          title="Quiz generation unavailable"
          detail="POST /api/quizzes/generate and POST /api/quizzes/answers currently return 501. No quiz is generated or scored by this frontend."
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <fieldset disabled className="space-y-4 rounded-lg border border-charcoal-700/70 bg-charcoal-900/60 p-5 opacity-60">
          <legend className="px-1 text-xs font-medium uppercase tracking-[0.12em] text-parchment-300">
            Generation settings
          </legend>
          <label className="block">
            <span className="subtle-label">Document</span>
            <select className="mt-1.5 h-10 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-sm">
              <option>{documents[0]?.original_filename ?? 'No documents available'}</option>
            </select>
          </label>
          <label className="block">
            <span className="subtle-label">Questions</span>
            <input type="number" defaultValue={5} className="mt-1.5 h-10 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-sm" />
          </label>
          <label className="block">
            <span className="subtle-label">Difficulty</span>
            <select className="mt-1.5 h-10 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-sm">
              <option>medium</option>
            </select>
          </label>
        </fieldset>

        <div className="flex items-center justify-center rounded-lg border border-dashed border-charcoal-700 bg-charcoal-950/40">
          <EmptyState
            compact
            icon={ListChecks}
            title="Quiz workspace"
            description="Questions, answer review, and evidence-backed results will appear here once the backend implements the contract."
          />
        </div>
      </div>
    </div>
  )
}
