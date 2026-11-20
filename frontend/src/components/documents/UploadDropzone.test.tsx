import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { UploadDropzone } from './UploadDropzone'

describe('UploadDropzone', () => {
  it('uploads a file selected from the input', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    render(<UploadDropzone onUpload={onUpload} isUploading={false} />)

    const file = new File(['%PDF-1.4'], 'lecture.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Choose PDF'), file)

    expect(onUpload).toHaveBeenCalledTimes(1)
    expect(onUpload).toHaveBeenCalledWith(file)
  })

  it('accepts a dropped PDF', () => {
    const onUpload = vi.fn()
    render(<UploadDropzone onUpload={onUpload} isUploading={false} />)

    const file = new File(['%PDF-1.4'], 'dropped.pdf', { type: 'application/pdf' })
    fireEvent.drop(screen.getByTestId('pdf-dropzone'), {
      dataTransfer: { files: [file] },
    })

    expect(onUpload).toHaveBeenCalledWith(file)
  })

  it('shows upload errors', () => {
    render(
      <UploadDropzone
        onUpload={vi.fn()}
        isUploading={false}
        error="Uploaded PDF exceeds the configured size limit."
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('size limit')
  })
})
