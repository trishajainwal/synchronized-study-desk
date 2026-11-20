import type { JsonValue } from './common'

export type AnnotationType = 'highlight' | 'note'

export interface AnnotationCreate {
  id: string
  session_id: string
  document_id: string
  page_number: number
  type: AnnotationType
  content: string
  color?: string | null
  quote?: string | null
  position?: Record<string, JsonValue> | null
  origin_device_id: string
}

export interface AnnotationUpdate {
  page_number?: number | null
  type?: AnnotationType | null
  content?: string | null
  color?: string | null
  quote?: string | null
  position?: Record<string, JsonValue> | null
  origin_device_id: string
}

export interface AnnotationRead {
  id: string
  session_id: string
  document_id: string
  page_number: number
  type: AnnotationType
  content: string
  color: string | null
  quote: string | null
  position: Record<string, JsonValue> | null
  created_by_device_id: string
  updated_by_device_id: string
  created_at: string
  updated_at: string
}

export interface AnnotationList {
  session_id: string
  document_id: string | null
  annotations: AnnotationRead[]
}
