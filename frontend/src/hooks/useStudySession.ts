import { useCallback, useEffect, useRef, useState } from 'react'
import {
  deleteAnnotation as deleteAnnotationRequest,
  listAnnotations,
  updateAnnotation as updateAnnotationRequest,
  createAnnotation as createAnnotationRequest,
} from '../api/annotations'
import { getReadingPosition, putReadingPosition } from '../api/readingPosition'
import { WS_BASE_URL } from '../api/config'
import { newId } from '../lib/session'
import type {
  AnnotationCreate,
  AnnotationRead,
  AnnotationUpdate,
} from '../types/annotation'
import type { DocumentRead } from '../types/document'
import type { EvidenceReference } from '../types/evidence'
import type { ServerSyncEvent, SyncStatus } from '../types/sync'
import { SyncClient } from '../sync/SyncClient'

export type AnnotationInput = Pick<
  AnnotationCreate,
  'page_number' | 'type' | 'content' | 'color' | 'quote' | 'position'
>

interface UseStudySessionOptions {
  sessionId: string
  deviceId: string
  document: DocumentRead | null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

function clampPage(page: number, pageCount: number | null): number {
  return Math.max(1, Math.min(page, pageCount ?? page))
}

export function useStudySession({
  sessionId,
  deviceId,
  document,
}: UseStudySessionOptions) {
  const documentId = document?.id ?? null
  const pageCountRef = useRef<number | null>(document?.page_count ?? null)
  const syncClientRef = useRef<SyncClient | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [annotations, setAnnotations] = useState<AnnotationRead[]>([])
  const [annotationsLoading, setAnnotationsLoading] = useState(false)
  const [annotationsError, setAnnotationsError] = useState<string | null>(null)
  const [positionError, setPositionError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const [connectedDeviceIds, setConnectedDeviceIds] = useState<string[]>([])
  const [connectionAttempt, setConnectionAttempt] = useState(0)

  useEffect(() => {
    pageCountRef.current = document?.page_count ?? null
  }, [document])

  const applyServerEvent = useCallback(
    (event: ServerSyncEvent) => {
      if (event.origin_device_id === deviceId && event.event !== 'error') return

      if (event.event === 'session_state') {
        setConnectedDeviceIds(event.connected_device_ids)
        setSyncError(null)
        return
      }

      if (event.event === 'connection_status') {
        setConnectedDeviceIds(event.connected_device_ids)
        return
      }

      if (event.event === 'error') {
        setSyncError(event.message)
        return
      }

      if (documentId && event.document_id && event.document_id !== documentId) return

      if (event.event === 'page_changed' || event.event === 'citation_navigated') {
        setCurrentPage(clampPage(event.page_number, pageCountRef.current))
        return
      }

      if (event.event === 'annotation_created') {
        if (documentId && event.annotation.document_id !== documentId) return
        setAnnotations((previous) => [
          ...previous.filter((item) => item.id !== event.annotation.id),
          event.annotation,
        ])
        return
      }

      if (event.event === 'annotation_updated') {
        setAnnotations((previous) =>
          previous.map((item) => (item.id === event.annotation.id ? event.annotation : item)),
        )
        return
      }

      if (event.event === 'annotation_deleted') {
        setAnnotations((previous) => previous.filter((item) => item.id !== event.annotation_id))
      }
    },
    [deviceId, documentId],
  )

  useEffect(() => {
    let cancelled = false
    setAnnotations([])
    setConnectedDeviceIds([])
    setSyncError(null)
    setCurrentPage(1)
    setPositionError(null)

    const client = new SyncClient({
      wsBaseUrl: WS_BASE_URL,
      sessionId,
      deviceId,
      documentId: documentId ?? undefined,
      onEvent: applyServerEvent,
      onStatus: setSyncStatus,
    })
    syncClientRef.current = client

    async function initialise(): Promise<void> {
      try {
        await client.connect()
        if (cancelled || !documentId) return

        setAnnotationsLoading(true)
        const [annotationResult, positionResult] = await Promise.allSettled([
          listAnnotations(sessionId, documentId),
          getReadingPosition(sessionId, documentId),
        ])

        if (cancelled) return

        if (annotationResult.status === 'fulfilled') {
          setAnnotations(annotationResult.value.annotations)
          setAnnotationsError(null)
        } else {
          setAnnotationsError(errorMessage(annotationResult.reason))
        }

        if (positionResult.status === 'fulfilled' && positionResult.value) {
          setCurrentPage(clampPage(positionResult.value.page_number, pageCountRef.current))
        }

        setAnnotationsLoading(false)
      } catch (error) {
        if (!cancelled) setSyncError(errorMessage(error))
      }
    }

    void initialise()

    return () => {
      cancelled = true
      client.disconnect()
      if (syncClientRef.current === client) syncClientRef.current = null
    }
  }, [sessionId, deviceId, documentId, connectionAttempt, applyServerEvent])

  const refreshAnnotations = useCallback(async () => {
    if (!documentId) return
    setAnnotationsLoading(true)
    try {
      const result = await listAnnotations(sessionId, documentId)
      setAnnotations(result.annotations)
      setAnnotationsError(null)
    } catch (error) {
      setAnnotationsError(errorMessage(error))
    } finally {
      setAnnotationsLoading(false)
    }
  }, [sessionId, documentId])

  const navigateToPage = useCallback(
    (page: number) => {
      const nextPage = clampPage(page, pageCountRef.current)
      setCurrentPage(nextPage)
      if (!documentId) return

      syncClientRef.current?.send({
        event: 'page_changed',
        session_id: sessionId,
        document_id: documentId,
        origin_device_id: deviceId,
        page_number: nextPage,
      })

      void putReadingPosition(sessionId, {
        document_id: documentId,
        page_number: nextPage,
        origin_device_id: deviceId,
      })
        .then(() => setPositionError(null))
        .catch((error: unknown) => setPositionError(errorMessage(error)))
    },
    [sessionId, deviceId, documentId],
  )

  const navigateToCitation = useCallback(
    (citation: EvidenceReference) => {
      if (documentId && citation.document_id !== documentId) {
        setSyncError('This citation belongs to a different document.')
        return
      }

      navigateToPage(citation.page_number)
      syncClientRef.current?.send({
        event: 'citation_navigated',
        session_id: sessionId,
        document_id: citation.document_id,
        page_number: citation.page_number,
        chunk_id: citation.chunk_id,
        quote: citation.quote,
        origin_device_id: deviceId,
      })
    },
    [documentId, navigateToPage, sessionId, deviceId],
  )

  const createAnnotation = useCallback(
    async (input: AnnotationInput): Promise<AnnotationRead> => {
      if (!documentId) throw new Error('Open a document before creating an annotation.')

      const annotation: AnnotationCreate = {
        id: newId(),
        session_id: sessionId,
        document_id: documentId,
        origin_device_id: deviceId,
        ...input,
      }

      const client = syncClientRef.current
      if (client?.isConnected()) {
        const sent = client.send({
          event: 'annotation_create',
          session_id: sessionId,
          document_id: documentId,
          origin_device_id: deviceId,
          annotation,
        })
        if (sent) {
          const now = new Date().toISOString()
          const optimistic: AnnotationRead = {
            ...annotation,
            color: annotation.color ?? null,
            quote: annotation.quote ?? null,
            position: annotation.position ?? null,
            created_by_device_id: deviceId,
            updated_by_device_id: deviceId,
            created_at: now,
            updated_at: now,
          }
          setAnnotations((previous) => [...previous, optimistic])
          return optimistic
        }
      }

      const created = await createAnnotationRequest(sessionId, annotation)
      setAnnotations((previous) => [...previous, created])
      return created
    },
    [sessionId, deviceId, documentId],
  )

  const updateAnnotation = useCallback(
    async (annotationId: string, changes: Omit<AnnotationUpdate, 'origin_device_id'>) => {
      const payload: AnnotationUpdate = { ...changes, origin_device_id: deviceId }
      const client = syncClientRef.current

      if (client?.isConnected()) {
        const sent = client.send({
          event: 'annotation_update',
          session_id: sessionId,
          document_id: documentId,
          origin_device_id: deviceId,
          annotation_id: annotationId,
          changes: payload,
        })
        if (sent) {
          setAnnotations((previous) =>
            previous.map((item) => {
              if (item.id !== annotationId) return item
              return {
                ...item,
                page_number: changes.page_number ?? item.page_number,
                type: changes.type ?? item.type,
                content: changes.content ?? item.content,
                color: changes.color === undefined ? item.color : changes.color,
                quote: changes.quote === undefined ? item.quote : changes.quote,
                position: changes.position === undefined ? item.position : changes.position,
                updated_by_device_id: deviceId,
                updated_at: new Date().toISOString(),
              }
            }),
          )
          return
        }
      }

      const updated = await updateAnnotationRequest(sessionId, annotationId, payload)
      setAnnotations((previous) =>
        previous.map((item) => (item.id === annotationId ? updated : item)),
      )
    },
    [sessionId, deviceId, documentId],
  )

  const deleteAnnotation = useCallback(
    async (annotationId: string) => {
      const client = syncClientRef.current
      if (client?.isConnected()) {
        const sent = client.send({
          event: 'annotation_delete',
          session_id: sessionId,
          document_id: documentId,
          origin_device_id: deviceId,
          annotation_id: annotationId,
        })
        if (sent) {
          setAnnotations((previous) => previous.filter((item) => item.id !== annotationId))
          return
        }
      }

      await deleteAnnotationRequest(sessionId, annotationId)
      setAnnotations((previous) => previous.filter((item) => item.id !== annotationId))
    },
    [sessionId, deviceId, documentId],
  )

  const reconnect = useCallback(() => {
    setConnectionAttempt((attempt) => attempt + 1)
  }, [])

  return {
    currentPage,
    annotations,
    annotationsLoading,
    annotationsError,
    positionError,
    syncStatus,
    syncError,
    connectedDeviceIds,
    navigateToPage,
    navigateToCitation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    refreshAnnotations,
    reconnect,
  }
}
