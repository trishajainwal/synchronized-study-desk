import type { HealthResponse, OllamaHealthResponse } from '../types/health'
import { apiRequest } from './client'
import { endpoints } from './endpoints'

export function getHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(endpoints.health)
}

export function getOllamaHealth(): Promise<OllamaHealthResponse> {
  return apiRequest<OllamaHealthResponse>(endpoints.ollamaHealth)
}
