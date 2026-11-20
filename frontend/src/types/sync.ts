import type { AnnotationCreate, AnnotationRead, AnnotationUpdate } from './annotation'

export type ConnectionStatusValue = 'connected' | 'disconnected'

export interface SyncEventBase {
  session_id: string
  document_id?: string | null
  origin_device_id: string
  timestamp?: string
}

export interface PageChangedEvent extends SyncEventBase {
  event: 'page_changed'
  page_number: number
}

export interface CitationNavigationEvent extends SyncEventBase {
  event: 'citation_navigated'
  document_id: string
  page_number: number
  chunk_id: string
  quote: string
}

export interface AnnotationCreateEvent extends SyncEventBase {
  event: 'annotation_create'
  annotation: AnnotationCreate
}

export interface AnnotationUpdateEvent extends SyncEventBase {
  event: 'annotation_update'
  annotation_id: string
  changes: AnnotationUpdate
}

export interface AnnotationDeleteEvent extends SyncEventBase {
  event: 'annotation_delete'
  annotation_id: string
}

export interface AnnotationCreatedEvent extends SyncEventBase {
  event: 'annotation_created'
  annotation: AnnotationRead
}

export interface AnnotationUpdatedEvent extends SyncEventBase {
  event: 'annotation_updated'
  annotation: AnnotationRead
}

export interface AnnotationDeletedEvent extends SyncEventBase {
  event: 'annotation_deleted'
  annotation_id: string
}

export interface ConnectionStatusEvent extends SyncEventBase {
  event: 'connection_status'
  status: ConnectionStatusValue
  connected_device_ids: string[]
}

export interface SessionStateEvent extends SyncEventBase {
  event: 'session_state'
  connected_device_ids: string[]
}

export interface SyncErrorEvent extends SyncEventBase {
  event: 'error'
  message: string
}

export type ClientSyncEvent =
  | PageChangedEvent
  | CitationNavigationEvent
  | AnnotationCreateEvent
  | AnnotationUpdateEvent
  | AnnotationDeleteEvent

export type ServerSyncEvent =
  | PageChangedEvent
  | CitationNavigationEvent
  | AnnotationCreatedEvent
  | AnnotationUpdatedEvent
  | AnnotationDeletedEvent
  | ConnectionStatusEvent
  | SessionStateEvent
  | SyncErrorEvent

export type SyncStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'
