import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest } from './client'
import { jsonResponse } from '../test/mocks'

describe('apiRequest', () => {
  afterEach(() => vi.restoreAllMocks())

  it('reports backend unavailability as a network-level error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))

    await expect(apiRequest('/api/health')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: expect.stringContaining('Unable to reach the backend'),
    })
  })

  it('surfaces backend error details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({ detail: 'Uploaded PDF is empty.' }, 400),
    )

    await expect(apiRequest('/api/documents', { method: 'POST' })).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        message: 'Uploaded PDF is empty.',
      }),
    )
  })

  it('formats validation errors from FastAPI', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(
        jsonResponse(
          {
            detail: [
              { loc: ['body', 'question'], msg: 'Field required', type: 'missing' },
            ],
          },
          422,
        ),
      ),
    )

    await expect(apiRequest('/api/chat', { method: 'POST' })).rejects.toBeInstanceOf(ApiError)
    await expect(apiRequest('/api/chat', { method: 'POST' })).rejects.toMatchObject({
      message: 'question: Field required',
    })
  })

  it('returns undefined for a 204 response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))

    await expect(apiRequest('/api/sessions/s/annotations/a', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})
