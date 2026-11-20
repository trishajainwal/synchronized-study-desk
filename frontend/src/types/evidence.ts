export interface EvidenceReference {
  document_id: string
  document_title: string
  page_number: number
  chunk_id: string
  quote: string
  relevance_score?: number | null
}
