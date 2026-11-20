import type { EvidenceReference } from './evidence'

export interface StudyReportRequest {
  session_id: string
  document_id: string
  from_date?: string | null
  to_date?: string | null
  include_quiz_results?: boolean
  include_reading_progress?: boolean
}

export interface ReportSection {
  title: string
  content: string
}

export interface StudyReportResponse {
  session_id: string
  document_id: string
  generated_at: string
  sections: ReportSection[]
  evidence: EvidenceReference[]
  model: string
}
