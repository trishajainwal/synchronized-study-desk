import type { EvidenceReference } from './evidence'

export type SummaryStyle = 'concise' | 'detailed' | 'exam_notes'

export interface SummaryRequest {
  document_id: string
  chapter?: string | null
  topic?: string | null
  style?: SummaryStyle
  max_words?: number
}

export interface SummaryResponse {
  document_id: string
  chapter: string | null
  topic: string | null
  summary: string
  evidence: EvidenceReference[]
  model: string
}
