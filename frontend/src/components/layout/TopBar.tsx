import { RefreshCw, Tablet } from 'lucide-react'
import { StatusBadge } from '../common/StatusBadge'
import type { DocumentRead } from '../../types/document'
import type { SyncStatus } from '../../types/sync'

interface TopBarProps {
  document: DocumentRead | null
  syncStatus: SyncStatus
  connectedDeviceIds: string[]
  sessionId: string
  onReconnect: () => void
}

function documentTone(status: DocumentRead['status'] | undefined) {
  if (status === 'ready') return 'positive' as const
  if (status === 'failed') return 'negative' as const
  if (status === 'processing' || status === 'pending') return 'warning' as const
  return 'neutral' as const
}

function syncLabel(status: SyncStatus): string {
  return {
    idle: 'Sync idle',
    connecting: 'Connecting',
    connected: 'Tablet link active',
    disconnected: 'Tablet link off',
    error: 'Sync error',
  }[status]
}

function syncTone(status: SyncStatus) {
  if (status === 'connected') return 'positive' as const
  if (status === 'connecting' || status === 'idle') return 'warning' as const
  return 'negative' as const
}

export function TopBar({
  document,
  syncStatus,
  connectedDeviceIds,
  sessionId,
  onReconnect,
}: TopBarProps) {
  return (
    <header className="flex min-h-20 flex-wrap items-center gap-x-6 gap-y-3 border-b border-charcoal-700/70 bg-charcoal-900/60 px-8 py-4">
      <div className="min-w-[220px] flex-1">
        <p className="subtle-label">Current document</p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="truncate font-serif text-lg text-parchment-100" title={document?.original_filename}>
            {document?.original_filename ?? 'No document open'}
          </h1>
          <StatusBadge tone={documentTone(document?.status)}>
            {document?.status ?? 'not selected'}
          </StatusBadge>
        </div>
      </div>

      <div>
        <p className="subtle-label">Tablet connection</p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge tone={syncTone(syncStatus)}>
            <Tablet size={12} /> {syncLabel(syncStatus)}
          </StatusBadge>
          <button
            type="button"
            onClick={onReconnect}
            title="Reconnect synchronisation"
            aria-label="Reconnect synchronisation"
            className="focus-ring rounded p-1 text-parchment-400 hover:bg-charcoal-800 hover:text-parchment-100"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-parchment-400">
          {connectedDeviceIds.length} device{connectedDeviceIds.length === 1 ? '' : 's'} linked
        </p>
      </div>

      <div>
        <p className="subtle-label">Study session</p>
        <p className="mt-1 max-w-[180px] truncate font-mono text-[11px] text-parchment-300" title={sessionId}>
          {sessionId}
        </p>
      </div>
    </header>
  )
}
