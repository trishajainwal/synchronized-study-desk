export interface HealthResponse {
  status: 'ok'
  app_name: string
  environment: string
  database: 'ok'
}

export interface OllamaHealthResponse {
  reachable: boolean
  model: string
  model_available: boolean
  base_url: string
  detail: string | null
}
