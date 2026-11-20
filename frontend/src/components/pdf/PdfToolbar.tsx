import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '../common/Button'

interface PdfToolbarProps {
  currentPage: number
  totalPages: number
  scale: number
  onPageChange: (page: number) => void
  onScaleChange: (scale: number) => void
}

export function PdfToolbar({
  currentPage,
  totalPages,
  scale,
  onPageChange,
  onScaleChange,
}: PdfToolbarProps) {
  const [pageInput, setPageInput] = useState(String(currentPage))

  function submitPage(event: FormEvent) {
    event.preventDefault()
    const parsed = Number.parseInt(pageInput, 10)
    if (Number.isFinite(parsed)) {
      onPageChange(parsed)
      setPageInput(String(Math.max(1, Math.min(parsed, totalPages))))
    } else {
      setPageInput(String(currentPage))
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-700/70 bg-charcoal-900/80 px-5 py-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <form onSubmit={submitPage} className="flex items-center gap-2">
          <label htmlFor="pdf-page-input" className="sr-only">
            Page number
          </label>
          <input
            id="pdf-page-input"
            type="number"
            min={1}
            max={totalPages || 1}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            className="focus-ring h-8 w-16 rounded-md border border-charcoal-700 bg-charcoal-950 px-2 text-center text-xs text-parchment-100"
          />
          <span className="text-xs text-parchment-400">/ {totalPages || '—'}</span>
        </form>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-1 text-xs text-parchment-400">Zoom</span>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Zoom out"
          disabled={scale <= 0.75}
          onClick={() => onScaleChange(Math.max(0.75, Number((scale - 0.25).toFixed(2))))}
        >
          <Minus size={14} />
        </Button>
        <span className="w-12 text-center font-mono text-xs text-parchment-300">
          {Math.round(scale * 100)}%
        </span>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Zoom in"
          disabled={scale >= 2}
          onClick={() => onScaleChange(Math.min(2, Number((scale + 0.25).toFixed(2))))}
        >
          <Plus size={14} />
        </Button>
      </div>
    </div>
  )
}
