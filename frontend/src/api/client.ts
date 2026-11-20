import type { ApiErrorBody, ValidationErrorItem } from '../types/common'
import { API_BASE_URL } from './config'

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody | null

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function formatDetail(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.detail) return fallback
  if (typeof body.detail === 'string') return body.detail

  return body.detail
    .map((item: ValidationErrorItem) => {
      const field = item.loc.filter((part) => part !== 'body').join('.')
      return field ? `${field}: ${item.msg}` : item.msg
    })
    .join('; ')
}

function jsonHeaders(headers?: HeadersInit): Headers {
  const result = new Headers(headers)
  if (!result.has('Content-Type')) result.set('Content-Type', 'application/json')
  return result
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, init)
  } catch {
    throw new ApiError(0, 'Unable to reach the backend. Check that the API server is running.')
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null
    try {
      body = (await response.json()) as ApiErrorBody
    } catch {
      body = null
    }
    throw new ApiError(
      response.status,
      formatDetail(body, `Backend request failed with status ${response.status}.`),
      body,
    )
  }

  if (response.status === 204) return undefined as T

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new ApiError(response.status, 'Backend returned an unexpected response format.')
  }

  return (await response.json()) as T
}

export function postJson<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
}

export function patchJson<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
}

export function putJson<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
}
