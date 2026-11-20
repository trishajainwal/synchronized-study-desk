import { useCallback, useEffect, useState } from 'react'
import { listDocuments, uploadDocument } from '../api/documents'
import type { DocumentRead } from '../types/document'

export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRead[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listDocuments()
      setDocuments(result.documents)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load documents.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const upload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const created = await uploadDocument(file)
      setDocuments((previous) => [created, ...previous])
      return created
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Upload failed.'
      setUploadError(message)
      throw caught
    } finally {
      setIsUploading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { documents, isLoading, isUploading, error, uploadError, refresh, upload }
}
