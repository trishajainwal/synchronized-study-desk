const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '')
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws')

export function documentFileUrl(documentId: string): string {
  return `${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/file`
}
