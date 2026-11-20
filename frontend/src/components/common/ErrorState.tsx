import { AlertCircle, RotateCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-100">
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-300" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-0.5 break-words text-red-200/80">{message}</p>
        {onRetry ? (
          <Button size="sm" variant="ghost" className="mt-2 -ml-3 text-red-200" onClick={onRetry}>
            <RotateCw size={13} /> Retry
          </Button>
        ) : null}
      </div>
    </div>
  )
}
