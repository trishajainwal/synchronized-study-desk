import { vi } from 'vitest'
import type { DocumentRead } from '../types/document'

export const testDocument: DocumentRead = {
  id: 'document-1',
  original_filename: 'lecture.pdf',
  content_type: 'application/pdf',
  size_bytes: 2048,
  sha256: 'abc123',
  status: 'ready',
  page_count: 2,
  error_message: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export function installApiMocks() {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.toString())
    const method = init?.method ?? 'GET'
    const path = url.pathname

    if (path === '/api/health') {
      return jsonResponse({
        status: 'ok',
        app_name: 'Synchronized Study Desk API',
        environment: 'test',
        database: 'ok',
      })
    }
    if (path === '/api/health/ollama') {
      return jsonResponse({
        reachable: false,
        model: 'test-model',
        model_available: false,
        base_url: 'http://ollama.test',
        detail: 'Not reachable in tests',
      })
    }
    if (path === '/api/documents' && method === 'GET') {
      return jsonResponse({ documents: [testDocument] })
    }
    if (path === '/api/documents' && method === 'POST') {
      const form = init?.body as FormData
      const file = form.get('file') as File
      return jsonResponse(
        {
          ...testDocument,
          id: 'uploaded-document',
          original_filename: file?.name ?? 'uploaded.pdf',
        },
        201,
      )
    }
    if (path.endsWith('/annotations') && method === 'GET') {
      return jsonResponse({
        session_id: 'test-session',
        document_id: 'document-1',
        annotations: [],
      })
    }
    if (path.endsWith('/reading-position') && method === 'GET') {
      return jsonResponse(null)
    }
    if (path.endsWith('/reading-position') && method === 'PUT') {
      return jsonResponse({
        id: 'position-1',
        session_id: 'test-session',
        document_id: 'document-1',
        page_number: 1,
        updated_at: new Date().toISOString(),
      })
    }
    if (path === '/api/chat' && method === 'POST') {
      return jsonResponse({ detail: 'This API contract is defined but not implemented.' }, 501)
    }

    return jsonResponse({ detail: 'Not found' }, 404)
  })
}

export class FakeWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  static instances: FakeWebSocket[] = []

  readonly url: string
  readyState = FakeWebSocket.OPEN
  sent: string[] = []
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: ((event: unknown) => void) | null = null
  onclose: ((event: unknown) => void) | null = null

  constructor(url: string) {
    this.url = url
    FakeWebSocket.instances.push(this)
    const parsed = new URL(url)
    const sessionId = parsed.pathname.split('/').at(-1) ?? 'test-session'
    queueMicrotask(() => {
      this.onmessage?.({
        data: JSON.stringify({
          event: 'session_state',
          session_id: sessionId,
          document_id: parsed.searchParams.get('document_id'),
          origin_device_id: parsed.searchParams.get('device_id'),
          connected_device_ids: [parsed.searchParams.get('device_id')],
        }),
      })
    })
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED
  }
}
