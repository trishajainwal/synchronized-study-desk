import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechResult {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechResultList {
  length: number
  [index: number]: SpeechResult
}

interface SpeechEvent extends Event {
  resultIndex: number
  results: SpeechResultList
}

interface SpeechErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechEvent) => void) | null
  onerror: ((event: SpeechErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

function describeError(code: string): string {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone permission was denied. Allow access in your browser settings.'
  }
  if (code === 'no-speech') return 'No speech was detected. Try again.'
  if (code === 'audio-capture') return 'No microphone was found.'
  if (code === 'network') return 'Speech recognition needs a network connection.'
  return `Voice input failed: ${code}`
}

export function useSpeechRecognition(onFinalTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const callbackRef = useRef(onFinalTranscript)

  useEffect(() => {
    callbackRef.current = onFinalTranscript
  }, [onFinalTranscript])

  const isSupported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined)

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const startListening = useCallback(() => {
    setError(null)
    if (!isSupported) {
      setError('Voice input is not supported in this browser.')
      return
    }

    if (recognitionRef.current) {
      stopListening()
      return
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!Recognition) return

    try {
      const recognition = new Recognition()
      recognition.lang = navigator.language || 'en-US'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onresult = (event) => {
        let finalText = ''
        let interimText = ''
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const result = event.results[index]
          if (result.isFinal) finalText += result[0].transcript
          else interimText += result[0].transcript
        }

        setInterimTranscript(interimText)
        if (finalText.trim()) {
          callbackRef.current(finalText.trim())
          recognition.stop()
        }
      }

      recognition.onerror = (event) => {
        setError(describeError(event.error))
      }

      recognition.onend = () => {
        recognitionRef.current = null
        setIsListening(false)
        setInterimTranscript('')
      }

      recognitionRef.current = recognition
      recognition.start()
      setIsListening(true)
    } catch {
      setError('Could not start voice input. Check microphone permissions.')
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [isSupported, stopListening])

  useEffect(
    () => () => {
      recognitionRef.current?.abort()
    },
    [],
  )

  return { isSupported, isListening, interimTranscript, error, startListening, stopListening }
}
