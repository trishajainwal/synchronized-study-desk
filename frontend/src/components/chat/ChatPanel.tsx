import { LoaderCircle, Mic, Send, Square } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import { sendChatMessage } from '../../api/ai'
import { newId } from '../../lib/session'
import type { DocumentRead } from '../../types/document'
import type { EvidenceReference } from '../../types/evidence'
import { Button } from '../common/Button'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { EvidencePanel } from './EvidencePanel'
import { useSpeechRecognition } from '../voice/useSpeechRecognition'

type MessageRole = 'user' | 'assistant' | 'system'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  evidence?: EvidenceReference[]
}

interface ChatPanelProps {
  sessionId: string
  document: DocumentRead | null
  currentPage: number
  onNavigateCitation: (citation: EvidenceReference) => void
}

function markdownComponents() {
  return {
    p: ({ children }: { children?: ReactNode }) => (
      <p className="mb-2 last:mb-0">{children}</p>
    ),
    ul: ({ children }: { children?: ReactNode }) => (
      <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>
    ),
    ol: ({ children }: { children?: ReactNode }) => (
      <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>
    ),
    code: ({ children }: { children?: ReactNode }) => (
      <code className="rounded bg-charcoal-950 px-1 py-0.5 font-mono text-[11px]">{children}</code>
    ),
  }
}

export function ChatPanel({ sessionId, document, currentPage, onNavigateCitation }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const appendTranscript = (text: string) => {
    setInput((current) => (current ? `${current} ${text}` : text))
  }
  const voice = useSpeechRecognition(appendTranscript)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  async function send() {
    const question = input.trim()
    if (!question || !document || isSending) return

    setMessages((previous) => [
      ...previous,
      { id: newId(), role: 'user', content: question, createdAt: new Date().toISOString() },
    ])
    setInput('')
    setIsSending(true)
    setError(null)

    try {
      const response = await sendChatMessage({
        session_id: sessionId,
        document_id: document.id,
        question,
        selected_page_numbers: [currentPage],
        max_evidence_passages: 5,
      })
      setMessages((previous) => [
        ...previous,
        {
          id: newId(),
          role: 'assistant',
          content: response.answer,
          evidence: response.evidence,
          createdAt: new Date().toISOString(),
        },
      ])
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 501) {
        setMessages((previous) => [
          ...previous,
          {
            id: newId(),
            role: 'system',
            content: `Chat is not available yet. The backend returned: ${caught.message}`,
            createdAt: new Date().toISOString(),
          },
        ])
      } else {
        setError(caught instanceof Error ? caught.message : 'Could not send the message.')
      }
    } finally {
      setIsSending(false)
    }
  }

  const evidence = messages.at(-1)?.evidence ?? []

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-charcoal-700/70 px-5 py-3">
        <div>
          <p className="text-sm font-medium text-parchment-100">Grounded chat</p>
          <p className="mt-0.5 text-[11px] text-parchment-400">
            Contract defined · endpoint not implemented
          </p>
        </div>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <EmptyState
            compact
            title="Ask about your document"
            description="Questions are sent to the backend chat contract. No answers are generated locally."
          />
        ) : (
          <div className="space-y-5">
            {messages.map((message) => (
              <div key={message.id} className="text-sm leading-relaxed">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-parchment-400">
                    {message.role === 'user'
                      ? 'You'
                      : message.role === 'assistant'
                        ? 'Assistant'
                        : 'System'}
                  </span>
                  <span className="font-mono text-[10px] text-parchment-400/70">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={
                    message.role === 'system'
                      ? 'rounded-md border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-amber-100'
                      : message.role === 'user'
                        ? 'whitespace-pre-wrap rounded-md border border-charcoal-700 bg-charcoal-850 px-3 py-2 text-parchment-200'
                        : 'text-parchment-200'
                  }
                >
                  <ReactMarkdown components={markdownComponents()}>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex items-center gap-2 text-xs text-parchment-400" role="status">
                <LoaderCircle size={14} className="animate-spin" /> Sending to backend…
              </div>
            ) : null}
          </div>
        )}
      </div>

      <EvidencePanel evidence={evidence} onNavigate={onNavigateCitation} />

      <div className="border-t border-charcoal-700/70 px-5 py-4">
        {error ? <div className="mb-3"><ErrorState message={error} /></div> : null}
        {voice.interimTranscript ? (
          <p className="mb-2 text-xs italic text-sage-300">“{voice.interimTranscript}”</p>
        ) : null}
        {voice.error ? <p className="mb-2 text-xs text-red-300" role="alert">{voice.error}</p> : null}

        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            rows={2}
            value={input}
            maxLength={4000}
            disabled={!document}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void send()
              }
            }}
            placeholder={document ? 'Ask a question about this document…' : 'Open a document first'}
            className="focus-ring min-h-[64px] flex-1 resize-none rounded-md border border-charcoal-700 bg-charcoal-950 px-3 py-2 text-sm text-parchment-100 placeholder:text-parchment-400/60 disabled:opacity-50"
          />
          <Button
            size="md"
            variant={voice.isListening ? 'danger' : 'ghost'}
            aria-label={voice.isListening ? 'Stop voice input' : 'Start voice input'}
            title={voice.isSupported ? 'Voice input' : 'Voice input is not supported in this browser'}
            onClick={voice.isListening ? voice.stopListening : voice.startListening}
          >
            {voice.isListening ? <Square size={15} /> : <Mic size={16} />}
          </Button>
          <Button
            size="md"
            variant="primary"
            aria-label="Send message"
            disabled={!document || !input.trim() || isSending}
            onClick={() => void send()}
          >
            <Send size={15} />
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-parchment-400">
          Transcriptions can be edited before sending. Enter sends; Shift+Enter adds a line.
        </p>
      </div>
    </div>
  )
}
