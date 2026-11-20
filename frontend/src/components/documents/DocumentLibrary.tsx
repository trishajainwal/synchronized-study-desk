import { FileText, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { StatusBadge } from '../common/StatusBadge'
import { formatBytes, formatDate } from '../../lib/format'
import type { DocumentRead } from '../../types/document'
import { UploadDropzone } from './UploadDropzone'

interface DocumentLibraryProps {
  documents: DocumentRead[]
  selectedDocumentId: string | null
  isLoading: boolean
  isUploading: boolean
  error: string | null
  uploadError: string | null
  onUpload: (file: File) => void
  onOpen: (documentId: string) => void
  onRefresh: () => void
}

function statusTone(status: DocumentRead['status']) {
  if (status === 'ready') return 'positive' as const
  if (status === 'failed') return 'negative' as const
  if (status === 'pending' || status === 'processing') return 'warning' as const
  return 'neutral' as const
}

export function DocumentLibrary({
  documents,
  selectedDocumentId,
  isLoading,
  isUploading,
  error,
  uploadError,
  onUpload,
  onOpen,
  onRefresh,
}: DocumentLibraryProps) {
  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="subtle-label">Library</p>
          <h2 className="mt-2 font-serif text-2xl text-parchment-100">Documents</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-parchment-400">
            Upload PDFs to build a local study library. Text extraction happens on the backend
            when the file is added.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      <div className="mt-8">
        <UploadDropzone onUpload={onUpload} isUploading={isUploading} error={uploadError} />
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={onRefresh} />
        </div>
      ) : null}

      <div className="mt-10">
        <div className="flex items-center justify-between border-b border-charcoal-700/70 pb-3">
          <h3 className="text-sm font-medium text-parchment-200">All documents</h3>
          <span className="text-xs text-parchment-400">{documents.length} total</span>
        </div>

        {isLoading && documents.length === 0 ? (
          <p className="py-10 text-center text-sm text-parchment-400">Loading documents…</p>
        ) : documents.length === 0 && !error ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload a PDF above to start a grounded study session."
          />
        ) : (
          <ul className="divide-y divide-charcoal-700/60">
            {documents.map((document) => {
              const selected = document.id === selectedDocumentId
              return (
                <li
                  key={document.id}
                  className={`flex flex-wrap items-center gap-4 py-4 ${selected ? 'text-parchment-100' : ''}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-charcoal-700 bg-charcoal-850 text-sage-300">
                    <FileText size={17} strokeWidth={1.6} />
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium" title={document.original_filename}>
                        {document.original_filename}
                      </p>
                      <StatusBadge tone={statusTone(document.status)}>{document.status}</StatusBadge>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-parchment-400">{document.id}</p>
                    {document.error_message ? (
                      <p className="mt-1.5 text-xs text-red-300" role="alert">
                        {document.error_message}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-xs text-parchment-400">
                    <p>{document.page_count === null ? '— pages' : `${document.page_count} pages`}</p>
                    <p className="mt-1">{formatBytes(document.size_bytes)}</p>
                    <p className="mt-1">{formatDate(document.created_at)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={selected ? 'primary' : 'secondary'}
                    onClick={() => onOpen(document.id)}
                    disabled={document.status !== 'ready'}
                  >
                    {selected ? 'Open' : 'Open'}
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
