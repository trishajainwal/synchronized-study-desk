import { useEffect, useMemo, useRef, useState } from 'react'
import { TopBar } from './components/layout/TopBar'
import { Sidebar } from './components/layout/Sidebar'
import { useBackendHealth } from './hooks/useBackendHealth'
import { useDocuments } from './hooks/useDocuments'
import { useStudySession } from './hooks/useStudySession'
import { getDeviceId, getSessionId, startNewSession } from './lib/session'
import { QuizSection } from './sections/QuizSection'
import { ReportSection } from './sections/ReportSection'
import { SettingsSection } from './sections/SettingsSection'
import { WorkspaceSection } from './sections/WorkspaceSection'
import { DocumentLibrary } from './components/documents/DocumentLibrary'
import type { Section } from './types/navigation'

export default function App() {
  const [sessionId, setSessionId] = useState(getSessionId)
  const deviceId = useMemo(() => getDeviceId(), [])
  const [activeSection, setActiveSection] = useState<Section>('workspace')
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const hasAutoOpened = useRef(false)

  const documents = useDocuments()
  const health = useBackendHealth()
  const selectedDocument =
    documents.documents.find((document) => document.id === selectedDocumentId) ?? null
  const study = useStudySession({ sessionId, deviceId, document: selectedDocument })

  useEffect(() => {
    if (hasAutoOpened.current || selectedDocumentId) return
    const firstReady = documents.documents.find((document) => document.status === 'ready')
    if (firstReady) {
      setSelectedDocumentId(firstReady.id)
      hasAutoOpened.current = true
    }
  }, [documents.documents, selectedDocumentId])

  function handleNewChat() {
    setSessionId(startNewSession())
    setSelectedDocumentId(null)
    setActiveSection('workspace')
  }

  async function handleUpload(file: File) {
    try {
      const created = await documents.upload(file)
      setSelectedDocumentId(created.id)
      setActiveSection('workspace')
    } catch {
      return
    }
  }

  function handleOpenDocument(documentId: string) {
    setSelectedDocumentId(documentId)
    setActiveSection('workspace')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-950 text-parchment-100">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onNewChat={handleNewChat}
        sessionId={sessionId}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          document={selectedDocument}
          syncStatus={study.syncStatus}
          connectedDeviceIds={study.connectedDeviceIds}
          sessionId={sessionId}
          onReconnect={study.reconnect}
        />

        <main
          className={`min-h-0 flex-1 ${activeSection === 'workspace' ? 'overflow-hidden' : 'overflow-auto'}`}
        >
          {activeSection === 'workspace' ? (
            <WorkspaceSection
              document={selectedDocument}
              sessionId={sessionId}
              currentPage={study.currentPage}
              annotations={study.annotations}
              annotationsLoading={study.annotationsLoading}
              annotationsError={study.annotationsError}
              positionError={study.positionError}
              syncError={study.syncError}
              syncStatus={study.syncStatus}
              onPageChange={study.navigateToPage}
              onNavigateCitation={study.navigateToCitation}
              onCreateAnnotation={study.createAnnotation}
              onUpdateAnnotation={study.updateAnnotation}
              onDeleteAnnotation={study.deleteAnnotation}
              onRefreshAnnotations={study.refreshAnnotations}
            />
          ) : null}

          {activeSection === 'library' ? (
            <DocumentLibrary
              documents={documents.documents}
              selectedDocumentId={selectedDocumentId}
              isLoading={documents.isLoading}
              isUploading={documents.isUploading}
              error={documents.error}
              uploadError={documents.uploadError}
              onUpload={(file) => void handleUpload(file)}
              onOpen={handleOpenDocument}
              onRefresh={() => void documents.refresh()}
            />
          ) : null}

          {activeSection === 'quizzes' ? <QuizSection documents={documents.documents} /> : null}
          {activeSection === 'reports' ? <ReportSection /> : null}

          {activeSection === 'settings' ? (
            <SettingsSection
              health={health.health}
              ollama={health.ollama}
              error={health.error}
              isChecking={health.isChecking}
              sessionId={sessionId}
              deviceId={deviceId}
              connectedDeviceIds={study.connectedDeviceIds}
              onRefresh={() => void health.refresh()}
            />
          ) : null}
        </main>
      </div>
    </div>
  )
}
