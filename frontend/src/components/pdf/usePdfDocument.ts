import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getDocument } from './pdfjs'

export function usePdfDocument(url: string | null) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let task: ReturnType<typeof getDocument> | null = null

    if (!url) {
      setPdf(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setPdf(null)

    const loadingTask = getDocument({ url })
    task = loadingTask

    loadingTask.promise
      .then((loaded) => {
        if (cancelled) return
        setPdf(loaded)
        setIsLoading(false)
      })
      .catch((caught: unknown) => {
        if (cancelled) return
        setError(caught instanceof Error ? caught.message : 'Could not load this PDF.')
        setIsLoading(false)
      })

    return () => {
      cancelled = true
      if (task) void task.destroy()
    }
  }, [url])

  return { pdf, isLoading, error }
}
