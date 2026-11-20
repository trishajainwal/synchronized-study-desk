import { useCallback, useEffect, useState } from 'react'
import { getHealth, getOllamaHealth } from '../api/health'
import type { HealthResponse, OllamaHealthResponse } from '../types/health'

export function useBackendHealth() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [ollama, setOllama] = useState<OllamaHealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const refresh = useCallback(async () => {
    setIsChecking(true)
    const [healthResult, ollamaResult] = await Promise.allSettled([
      getHealth(),
      getOllamaHealth(),
    ])

    if (healthResult.status === 'fulfilled') {
      setHealth(healthResult.value)
      setError(null)
    } else {
      setHealth(null)
      setError(
        healthResult.reason instanceof Error
          ? healthResult.reason.message
          : 'Backend health check failed.',
      )
    }

    setOllama(ollamaResult.status === 'fulfilled' ? ollamaResult.value : null)
    setIsChecking(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { health, ollama, error, isChecking, refresh }
}
