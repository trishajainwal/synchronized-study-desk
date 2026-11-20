import { MessageSquareText, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { AnnotationPanel } from '../components/annotations/AnnotationPanel'
import { ChatPanel } from '../components/chat/ChatPanel'
import { ErrorState } from '../components/common/ErrorState'
import { PdfReader } from '../components/pdf/PdfReader'
import type { AnnotationInput } from '../hooks/useStudySession'
import type {
  AnnotationRead,
  AnnotationUpdate,
} from '../types/annotation'
import type { DocumentRead } from '../types/document'
import type { EvidenceReference } from '../types/evidence'

type Panel = 'chat' | 'annotations'

interface WorkspaceSectionProps {
  document: DocumentRead | null
  sessionId: string
  currentPage: number
  annotations: AnnotationRead[]
  annotationsLoading: boolean
  annotationsError: string | null
  positionError: string | null
  syncError: string | null
  syncStatus: string
  onPageChange: (page: number) => void
  onNavigateCitation: (citation: EvidenceReference) => void
  onCreateAnnotation: (input: AnnotationInput) => Promise<AnnotationRead>
  onUpdateAnnotation: (
    id: string,
    changes: Omit<AnnotationUpdate, 'origin_device_id'>,
  ) => Promise<void>
  onDeleteAnnotation: (id: string) => Promise<void>
  onRefreshAnnotations: () => Promise<void>
}

export function WorkspaceSection({
  document,
  sessionId,
  currentPage,
  annotations,
  annotationsLoading,
  annotationsError,
  positionError,
  syncError,
  syncStatus,
  onPageChange,
  onNavigateCitation,
  onCreateAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onRefreshAnnotations,
}: WorkspaceSectionProps) {
  const [panel, setPanel] = useState<Panel>('chat')

  return (
    <div className="flex h-full min-h-0 flex-col">
      {syncError ? (
        <div className="border-b border-charcoal-700/70 px-6 py-3">
          <ErrorState message={syncError} />
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-h-[520px] min-w-0 border-b border-charcoal-700/70 xl:border-b-0 xl:border-r">
          <PdfReader
            document={document}
            currentPage={currentPage}
            onPageChange={onPageChange}
            positionError={positionError}
          />
        </div>

        <div className="flex min-h-0 flex-col">
          <div className="flex border-b border-charcoal-700/70 px-3 pt-3" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'chat'}
              onClick={() => setPanel('chat')}
              className={`focus-ring flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-medium ${
                panel === 'chat'
                  ? 'border-sage-400 text-parchment-100'
                  : 'border-transparent text-parchment-400 hover:text-parchment-200'
              }`}
            >
              <MessageSquareText size={14} /> Chat
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={panel === 'annotations'}
              onClick={() => setPanel('annotations')}
              className={`focus-ring flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-medium ${
                panel === 'annotations'
                  ? 'border-sage-400 text-parchment-100'
                  : 'border-transparent text-parchment-400 hover:text-parchment-200'
              }`}
            >
              <StickyNote size={14} /> Annotations
              {annotations.length > 0 ? (
                <span className="rounded-full bg-charcoal-800 px-1.5 text-[10px] text-parchment-300">
                  {annotations.length}
                </span>
              ) : null}
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {panel === 'chat' ? (
              <ChatPanel
                sessionId={sessionId}
                document={document}
                currentPage={currentPage}
                onNavigateCitation={onNavigateCitation}
              />
            ) : (
              <AnnotationPanel
                annotations={annotations}
                currentPage={currentPage}
                isLoading={annotationsLoading}
                error={annotationsError}
                isSyncConnected={syncStatus === 'connected'}
                onCreate={onCreateAnnotation}
                onUpdate={onUpdateAnnotation}
                onDelete={onDeleteAnnotation}
                onJumpToPage={onPageChange}
                onRefresh={() => void onRefreshAnnotations()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
