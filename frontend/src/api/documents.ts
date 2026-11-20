import type { DocumentList, DocumentPageList, DocumentRead } from '../types/document'
import { apiRequest } from './client'
import { endpoints } from './endpoints'

export function listDocuments(): Promise<DocumentList> {
  return apiRequest<DocumentList>(endpoints.documents)
}

export function uploadDocument(file: File): Promise<DocumentRead> {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<DocumentRead>(endpoints.documents, {
    method: 'POST',
    body: formData,
  })
}

export function getDocument(documentId: string): Promise<DocumentRead> {
  return apiRequest<DocumentRead>(endpoints.document(documentId))
}

export function getDocumentPages(documentId: string): Promise<DocumentPageList> {
  return apiRequest<DocumentPageList>(endpoints.documentPages(documentId))
}
