import { BookMarked } from 'lucide-react'
import type { EvidenceReference } from '../../types/evidence'
import { CitationChip } from './CitationChip'

interface EvidencePanelProps {
  evidence: EvidenceReference[]
  onNavigate: (citation: EvidenceReference) => void
}

export function EvidencePanel({ evidence, onNavigate }: EvidencePanelProps) {
  return (
    <section className="border-t border-charcoal-700/70 px-5 py-4">
      <div className="flex items-center gap-2">
        <BookMarked size={14} className="text-sage-300" />
        <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-parchment-300">
          Evidence
        </h3>
        <span className="text-[10px] text-parchment-400">{evidence.length} passages</span>
      </div>

      {evidence.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-parchment-400">
          Grounded passages will appear here when the chat endpoint is implemented. Selecting one
          will navigate the reader to its page.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {evidence.map((citation) => (
            <CitationChip
              key={`${citation.document_id}-${citation.chunk_id}`}
              citation={citation}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </section>
  )
}
