import type { EvidenceReference } from './evidence'

export type ConfidenceStatus = 'high' | 'medium' | 'low' | 'insufficient'

export interface ChatRequest {
  session_id: string
  document_id?: string | null
  question: string
  selected_page_numbers?: number[]
  max_evidence_passages?: number
}

export interface ChatResponse {
  answer: string
  evidence: EvidenceReference[]
  confidence: ConfidenceStatus
  refused: boolean
  refusal_reason: string | null
  model: string
}
