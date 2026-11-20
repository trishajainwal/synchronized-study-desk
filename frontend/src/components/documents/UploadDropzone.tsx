import { LoaderCircle, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../common/Button'

interface UploadDropzoneProps {
  onUpload: (file: File) => void
  isUploading: boolean
  error?: string | null
}

export function UploadDropzone({ onUpload, isUploading, error }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    if (!file || isUploading) return
    onUpload(file)
  }

  return (
    <div>
      <div
        data-testid="pdf-dropzone"
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFile(event.dataTransfer.files[0])
        }}
        className={`rounded-xl border border-dashed px-8 py-10 text-center transition-colors ${
          isDragging
            ? 'border-sage-400 bg-sage-600/10'
            : 'border-charcoal-700 bg-charcoal-950/40'
        }`}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-sage-600/40 bg-sage-600/10 text-sage-300">
          {isUploading ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Upload size={18} strokeWidth={1.6} />
          )}
        </div>
        <p className="mt-4 font-serif text-base text-parchment-100">
          {isUploading ? 'Uploading and extracting text…' : 'Drop a PDF to add it to your library'}
        </p>
        <p className="mt-1.5 text-xs text-parchment-400">
          Processing is synchronous. The document opens when extraction completes.
        </p>
        <Button
          className="mt-5"
          variant="secondary"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          Choose PDF
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          aria-label="Choose PDF"
          className="sr-only"
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ''
          }}
        />
      </div>
      {error ? <p className="mt-3 text-xs text-red-300" role="alert">{error}</p> : null}
    </div>
  )
}
