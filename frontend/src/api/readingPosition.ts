import type { ReadingPositionRead, ReadingPositionUpdate } from '../types/reading'
import { apiRequest, putJson } from './client'
import { endpoints } from './endpoints'

export function getReadingPosition(
  sessionId: string,
  documentId: string,
): Promise<ReadingPositionRead | null> {
  const query = `?document_id=${encodeURIComponent(documentId)}`
  return apiRequest<ReadingPositionRead | null>(
    `${endpoints.readingPosition(sessionId)}${query}`,
  )
}

export function putReadingPosition(
  sessionId: string,
  data: ReadingPositionUpdate,
): Promise<ReadingPositionRead> {
  return putJson<ReadingPositionRead>(endpoints.readingPosition(sessionId), data)
}
