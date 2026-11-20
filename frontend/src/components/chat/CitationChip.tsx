import { FileText } from 'lucide-react'
import type { EvidenceReference } from '../../types/evidence'

interface CitationChipProps {
  citation: EvidenceReference
  onNavigate: (citation: EvidenceReference) => void
}

export function CitationChip({ citation, onNavigate }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(citation)}
      title={`${citation.document_title} — ${citation.quote}`}
      className="focus-ring inline-flex max-w-full items-center gap-1.5 rounded-full border border-sage-600/40 bg-sage-600/10 px-2.5 py-1 text-[11px] text-sage-200 hover:bg-sage-600/20"
    >
      <FileText size={11} />
      <span className="truncate">{citation.document_title}</span>
      <span className="font-mono text-sage-300">p.{citation.page_number}</span>
    </button>
  )
}
