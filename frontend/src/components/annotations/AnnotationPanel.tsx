import { Pencil, Plus, Quote, RefreshCw, StickyNote, Trash2 } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import type { AnnotationInput } from '../../hooks/useStudySession'
import type {
  AnnotationRead,
  AnnotationType,
  AnnotationUpdate,
} from '../../types/annotation'

interface AnnotationPanelProps {
  annotations: AnnotationRead[]
  currentPage: number
  isLoading: boolean
  error: string | null
  isSyncConnected: boolean
  onCreate: (input: AnnotationInput) => Promise<unknown>
  onUpdate: (id: string, changes: Omit<AnnotationUpdate, 'origin_device_id'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onJumpToPage: (page: number) => void
  onRefresh: () => void
}

interface Draft {
  page_number: number
  type: AnnotationType
  content: string
  quote: string
  color: string
}

function emptyDraft(page: number): Draft {
  return { page_number: page, type: 'note', content: '', quote: '', color: '' }
}

function draftFrom(annotation: AnnotationRead): Draft {
  return {
    page_number: annotation.page_number,
    type: annotation.type,
    content: annotation.content,
    quote: annotation.quote ?? '',
    color: annotation.color ?? '',
  }
}

export function AnnotationPanel({
  annotations,
  currentPage,
  isLoading,
  error,
  isSyncConnected,
  onCreate,
  onUpdate,
  onDelete,
  onJumpToPage,
  onRefresh,
}: AnnotationPanelProps) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(currentPage))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.content.trim()) return

    setIsSaving(true)
    setActionError(null)
    try {
      const payload = {
        page_number: draft.page_number,
        type: draft.type,
        content: draft.content.trim(),
        quote: draft.quote.trim() || null,
        color: draft.color.trim() || null,
      }
      if (editingId) {
        await onUpdate(editingId, payload)
      } else {
        await onCreate({ ...payload, position: null })
      }
      setDraft(emptyDraft(draft.page_number))
      setEditingId(null)
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Could not save annotation.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-charcoal-700/70 px-5 py-3">
        <div>
          <p className="text-sm font-medium text-parchment-100">Annotations</p>
          <p className="mt-0.5 text-[11px] text-parchment-400">
            {isSyncConnected ? 'Changes synchronise with linked devices.' : 'Saving through the API.'}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={onRefresh} aria-label="Refresh annotations">
          <RefreshCw size={14} />
        </Button>
      </div>

      <div className="border-b border-charcoal-700/70 px-5 py-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-2">
            <label className="flex-1">
              <span className="subtle-label">Page</span>
              <input
                type="number"
                min={1}
                value={draft.page_number}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    page_number: Number.parseInt(event.target.value, 10) || 1,
                  }))
                }
                className="focus-ring mt-1 h-9 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-sm text-parchment-100"
              />
            </label>
            <label className="flex-1">
              <span className="subtle-label">Type</span>
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as AnnotationType,
                  }))
                }
                className="focus-ring mt-1 h-9 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-sm text-parchment-100"
              >
                <option value="note">Note</option>
                <option value="highlight">Highlight</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="subtle-label">Content</span>
            <textarea
              value={draft.content}
              onChange={(event) =>
                setDraft((current) => ({ ...current, content: event.target.value }))
              }
              rows={3}
              maxLength={20000}
              placeholder="Write a note about this page…"
              className="focus-ring mt-1 w-full resize-y rounded-md border border-charcoal-700 bg-charcoal-950 px-3 py-2 text-sm text-parchment-100 placeholder:text-parchment-400/60"
            />
          </label>

          <div className="flex gap-2">
            <label className="flex-1">
              <span className="subtle-label">Quote (optional)</span>
              <input
                type="text"
                value={draft.quote}
                maxLength={20000}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, quote: event.target.value }))
                }
                className="focus-ring mt-1 h-9 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-xs text-parchment-100"
              />
            </label>
            <Button
              size="sm"
              variant="ghost"
              className="mt-5"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  quote: window.getSelection()?.toString().trim() ?? current.quote,
                }))
              }
              title="Use text selected in the PDF"
            >
              <Quote size={14} /> Selection
            </Button>
          </div>

          <label className="block">
            <span className="subtle-label">Colour (optional)</span>
            <input
              type="text"
              value={draft.color}
              maxLength={20}
              placeholder="sage"
              onChange={(event) =>
                setDraft((current) => ({ ...current, color: event.target.value }))
              }
              className="focus-ring mt-1 h-9 w-full rounded-md border border-charcoal-700 bg-charcoal-950 px-3 text-xs text-parchment-100"
            />
          </label>

          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="primary" disabled={isSaving || !draft.content.trim()}>
              <Plus size={14} /> {editingId ? 'Save changes' : 'Add annotation'}
            </Button>
            {editingId ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(null)
                  setDraft(emptyDraft(currentPage))
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
        {actionError ? <p className="mt-3 text-xs text-red-300" role="alert">{actionError}</p> : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {error ? <div className="p-4"><ErrorState message={error} onRetry={onRefresh} /></div> : null}
        {isLoading ? <p className="px-5 py-6 text-xs text-parchment-400">Loading annotations…</p> : null}
        {!isLoading && annotations.length === 0 && !error ? (
          <EmptyState
            compact
            icon={StickyNote}
            title="No annotations"
            description="Add a note tied to the current page, or receive one from a linked tablet."
          />
        ) : null}

        <ul className="divide-y divide-charcoal-700/60">
          {annotations.map((annotation) => (
            <li key={annotation.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onJumpToPage(annotation.page_number)}
                      className="focus-ring rounded border border-sage-600/40 bg-sage-600/10 px-2 py-0.5 font-mono text-[10px] text-sage-200 hover:bg-sage-600/20"
                    >
                      p. {annotation.page_number}
                    </button>
                    <span className="text-[10px] uppercase tracking-wider text-parchment-400">
                      {annotation.type}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-parchment-200">
                    {annotation.content}
                  </p>
                  {annotation.quote ? (
                    <p className="mt-2 border-l-2 border-sage-600/60 pl-3 text-xs italic text-parchment-400">
                      “{annotation.quote}”
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label={`Edit annotation ${annotation.id}`}
                    onClick={() => {
                      setEditingId(annotation.id)
                      setDraft(draftFrom(annotation))
                    }}
                    className="focus-ring rounded p-1.5 text-parchment-400 hover:bg-charcoal-800 hover:text-parchment-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete annotation ${annotation.id}`}
                    onClick={() => {
                      void onDelete(annotation.id).catch((caught: unknown) =>
                        setActionError(
                          caught instanceof Error ? caught.message : 'Could not delete annotation.',
                        ),
                      )
                    }}
                    className="focus-ring rounded p-1.5 text-parchment-400 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
