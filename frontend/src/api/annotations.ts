import type {
  AnnotationCreate,
  AnnotationList,
  AnnotationRead,
  AnnotationUpdate,
} from '../types/annotation'
import { apiRequest, patchJson, postJson } from './client'
import { endpoints } from './endpoints'

export function listAnnotations(
  sessionId: string,
  documentId?: string,
): Promise<AnnotationList> {
  const query = documentId ? `?document_id=${encodeURIComponent(documentId)}` : ''
  return apiRequest<AnnotationList>(`${endpoints.annotations(sessionId)}${query}`)
}

export function createAnnotation(
  sessionId: string,
  data: AnnotationCreate,
): Promise<AnnotationRead> {
  return postJson<AnnotationRead>(endpoints.annotations(sessionId), data)
}

export function updateAnnotation(
  sessionId: string,
  annotationId: string,
  changes: AnnotationUpdate,
): Promise<AnnotationRead> {
  return patchJson<AnnotationRead>(endpoints.annotation(sessionId, annotationId), changes)
}

export function deleteAnnotation(sessionId: string, annotationId: string): Promise<void> {
  return apiRequest<void>(endpoints.annotation(sessionId, annotationId), {
    method: 'DELETE',
  })
}
