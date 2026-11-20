import { FileText, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'
import { documentFileUrl } from '../../api/config'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { formatBytes, formatDate } from '../../lib/format'
import type { DocumentRead } from '../../types/document'
import { PdfPage } from './PdfPage'
import { PdfToolbar } from './PdfToolbar'
import { usePdfDocument } from './usePdfDocument'

interface PdfReaderProps {
  document: DocumentRead | null
  currentPage: number
  onPageChange: (page: number) => void
  positionError?: string | null
}

export function PdfReader({ document, currentPage, onPageChange, positionError }: PdfReaderProps) {
  const [scale, setScale] = useState(1)
  const [page, setPage] = useState<PDFPageProxy | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const { pdf, isLoading, error } = usePdfDocument(
    document?.status === 'ready' ? documentFileUrl(document.id) : null,
  )

  useEffect(() => {
    if (!pdf) {
      setPage(null)
      return
    }

    let cancelled = false
    const target = Math.max(1, Math.min(currentPage, pdf.numPages))
    if (target !== currentPage) onPageChange(target)

    setPageError(null)
    pdf
      .getPage(target)
      .then((loaded) => {
        if (!cancelled) setPage(loaded)
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setPage(null)
          setPageError(caught instanceof Error ? caught.message : 'Could not load this page.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [pdf, currentPage, onPageChange])

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={FileText}
          title="No document open"
          description="Open a PDF from the library to read it and start a study session."
        />
      </div>
    )
  }

  const totalPages = pdf?.numPages ?? document.page_count ?? 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-700/70 px-5 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-parchment-100">
            {document.original_filename}
          </p>
          <p className="mt-0.5 text-[11px] text-parchment-400">
            {totalPages} pages · {formatBytes(document.size_bytes)} · added{' '}
            {formatDate(document.created_at)}
          </p>
        </div>
        <span className="font-mono text-[10px] text-parchment-400" title={document.sha256}>
          sha256 {document.sha256.slice(0, 12)}…
        </span>
      </div>

      <PdfToolbar
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        onPageChange={onPageChange}
        onScaleChange={setScale}
      />

      {error || pageError || positionError ? (
        <div className="border-b border-charcoal-700/70 px-5 py-3">
          {error ? <ErrorState message={error} /> : null}
          {pageError ? <ErrorState message={pageError} /> : null}
          {positionError ? <ErrorState message={positionError} /> : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-auto bg-charcoal-850 px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-parchment-400">
            <LoaderCircle size={16} className="animate-spin" /> Loading PDF…
          </div>
        ) : page ? (
          <div className="flex justify-center">
            <PdfPage page={page} scale={scale} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
