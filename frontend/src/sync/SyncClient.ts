import { endpoints } from '../api/endpoints'
import type {
  ClientSyncEvent,
  ServerSyncEvent,
  SyncErrorEvent,
  SyncStatus,
} from '../types/sync'

interface SyncClientOptions {
  wsBaseUrl: string
  sessionId: string
  deviceId: string
  documentId?: string
  onEvent: (event: ServerSyncEvent) => void
  onStatus: (status: SyncStatus) => void
}

function isSyncEvent(value: unknown): value is ServerSyncEvent {
  return typeof value === 'object' && value !== null && 'event' in value
}

export class SyncClient {
  private readonly options: SyncClientOptions
  private socket: WebSocket | null = null
  private connection: Promise<void> | null = null
  private resolveConnection: (() => void) | null = null
  private rejectConnection: ((error: Error) => void) | null = null
  private closingIntentionally = false

  constructor(options: SyncClientOptions) {
    this.options = options
  }

  connect(): Promise<void> {
    if (this.connection) return this.connection
    if (typeof WebSocket === 'undefined') {
      return Promise.reject(new Error('WebSocket is not supported in this browser.'))
    }

    this.closingIntentionally = false
    this.options.onStatus('connecting')

    this.connection = new Promise<void>((resolve, reject) => {
      this.resolveConnection = resolve
      this.rejectConnection = reject

      const params = new URLSearchParams({ device_id: this.options.deviceId })
      if (this.options.documentId) params.set('document_id', this.options.documentId)

      const socket = new WebSocket(
        `${this.options.wsBaseUrl}${endpoints.sessionSocket(this.options.sessionId)}?${params.toString()}`,
      )
      this.socket = socket

      socket.onmessage = (message: MessageEvent<string>) => {
        let parsed: unknown
        try {
          parsed = JSON.parse(message.data)
        } catch {
          this.emitError('Received an invalid sync message from the backend.')
          return
        }

        if (!isSyncEvent(parsed)) {
          this.emitError('Received an invalid sync event from the backend.')
          return
        }

        if (parsed.event === 'session_state') {
          this.options.onStatus('connected')
          this.resolveConnection?.()
          this.resolveConnection = null
          this.rejectConnection = null
        }

        this.options.onEvent(parsed)
      }

      socket.onerror = () => {
        const error = new Error('Could not establish the synchronisation connection.')
        this.options.onStatus('error')
        this.rejectConnection?.(error)
        this.resolveConnection = null
        this.rejectConnection = null
      }

      socket.onclose = (event: CloseEvent) => {
        this.socket = null
        this.connection = null
        if (this.closingIntentionally) {
          this.options.onStatus('disconnected')
          return
        }

        this.options.onStatus('disconnected')
        const message = event.reason || 'Synchronisation connection closed.'
        this.rejectConnection?.(new Error(message))
        this.resolveConnection = null
        this.rejectConnection = null
      }
    })

    return this.connection
  }

  disconnect(): void {
    this.closingIntentionally = true
    this.resolveConnection = null
    this.rejectConnection = null
    this.connection = null
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect')
      this.socket = null
    }
    this.options.onStatus('disconnected')
  }

  send(event: ClientSyncEvent): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false
    this.socket.send(JSON.stringify(event))
    return true
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  private emitError(message: string): void {
    const event: SyncErrorEvent = {
      event: 'error',
      session_id: this.options.sessionId,
      document_id: this.options.documentId ?? null,
      origin_device_id: this.options.deviceId,
      message,
    }
    this.options.onEvent(event)
  }
}
