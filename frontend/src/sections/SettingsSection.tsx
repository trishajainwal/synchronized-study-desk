import { RefreshCw } from 'lucide-react'
import { API_BASE_URL, WS_BASE_URL } from '../api/config'
import { Button } from '../components/common/Button'
import { ErrorState } from '../components/common/ErrorState'
import { StatusBadge } from '../components/common/StatusBadge'
import type { HealthResponse, OllamaHealthResponse } from '../types/health'

interface SettingsSectionProps {
  health: HealthResponse | null
  ollama: OllamaHealthResponse | null
  error: string | null
  isChecking: boolean
  sessionId: string
  deviceId: string
  connectedDeviceIds: string[]
  onRefresh: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-700/60 py-3 last:border-0">
      <span className="text-xs text-parchment-400">{label}</span>
      <span className="max-w-full break-all font-mono text-[11px] text-parchment-200">{value}</span>
    </div>
  )
}

export function SettingsSection({
  health,
  ollama,
  error,
  isChecking,
  sessionId,
  deviceId,
  connectedDeviceIds,
  onRefresh,
}: SettingsSectionProps) {
  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="subtle-label">Configuration</p>
          <h2 className="mt-2 font-serif text-2xl text-parchment-100">Settings</h2>
        </div>
        <Button size="sm" onClick={onRefresh} disabled={isChecking}>
          <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} /> Check backend
        </Button>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={onRefresh} />
        </div>
      ) : null}

      <div className="mt-8 rounded-lg border border-charcoal-700/70 bg-charcoal-900/60 px-5 py-4">
        <h3 className="text-sm font-medium text-parchment-100">Service status</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <StatusBadge tone={health ? 'positive' : 'negative'}>
            API {health ? 'healthy' : 'unavailable'}
          </StatusBadge>
          <StatusBadge tone={health?.database === 'ok' ? 'positive' : 'negative'}>
            Database {health?.database ?? 'unknown'}
          </StatusBadge>
          <StatusBadge tone={ollama?.model_available ? 'positive' : 'warning'}>
            Model {ollama?.model_available ? 'available' : 'not available'}
          </StatusBadge>
        </div>
        {ollama?.detail ? (
          <p className="mt-3 text-xs text-parchment-400">{ollama.detail}</p>
        ) : null}
      </div>

      <div className="mt-6 rounded-lg border border-charcoal-700/70 bg-charcoal-900/60 px-5 py-4">
        <h3 className="text-sm font-medium text-parchment-100">Connection</h3>
        <div className="mt-3">
          <Row label="Backend URL" value={API_BASE_URL} />
          <Row label="WebSocket URL" value={WS_BASE_URL} />
          <Row label="Configured via" value="VITE_API_BASE_URL" />
          <Row label="Session ID" value={sessionId} />
          <Row label="This device" value={deviceId} />
          <Row label="Linked devices" value={connectedDeviceIds.join(', ') || 'none'} />
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-parchment-400">
          The backend CORS allow-list must include this frontend origin, and the API must be
          reachable from this machine. No endpoint URLs are hardcoded in components.
        </p>
      </div>
    </div>
  )
}
