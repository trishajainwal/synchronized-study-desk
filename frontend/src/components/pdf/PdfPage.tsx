import { useEffect, useRef } from 'react'
import { TextLayer } from 'pdfjs-dist'
import type { PDFPageProxy } from 'pdfjs-dist'

interface PdfPageProps {
  page: PDFPageProxy
  scale: number
}

export function PdfPage({ page, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const textLayerContainer = textLayerRef.current
    if (!canvas || !textLayerContainer) return

    const viewport = page.getViewport({ scale })
    const outputScale = window.devicePixelRatio || 1
    let cancelled = false
    let renderTask: ReturnType<PDFPageProxy['render']> | null = null
    let textLayer: TextLayer | null = null

    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
    textLayerContainer.style.width = `${viewport.width}px`
    textLayerContainer.style.height = `${viewport.height}px`

    renderTask = page.render({
      canvas,
      viewport,
      transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
    })

    void page.getTextContent().then((content) => {
      if (cancelled) return
      textLayerContainer.replaceChildren()
      textLayer = new TextLayer({
        textContentSource: content,
        container: textLayerContainer,
        viewport,
      })
      void textLayer.render()
    })

    return () => {
      cancelled = true
      textLayer?.cancel()
      renderTask?.cancel()
      textLayerContainer.replaceChildren()
    }
  }, [page, scale])

  return (
    <div className="pdf-page-wrapper" style={{ width: page.getViewport({ scale }).width }}>
      <canvas ref={canvasRef} className="block bg-white" />
      <div ref={textLayerRef} className="textLayer" aria-hidden="false" />
    </div>
  )
}
