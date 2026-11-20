export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface DocumentRead {
  id: string
  original_filename: string
  content_type: string
  size_bytes: number
  sha256: string
  status: DocumentStatus
  page_count: number | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface DocumentList {
  documents: DocumentRead[]
}

export interface DocumentPageRead {
  id: number
  document_id: string
  page_number: number
  text: string
  char_count: number
}

export interface DocumentPageList {
  document_id: string
  pages: DocumentPageRead[]
}
