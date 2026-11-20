import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { FakeWebSocket, installApiMocks } from './test/mocks'

describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear()
    FakeWebSocket.instances.length = 0
    vi.stubGlobal('WebSocket', FakeWebSocket)
    installApiMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the persistent workspace shell', async () => {
    render(<App />)

    expect(screen.getByText('Synchronized')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Study workspace' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Library' })).toBeInTheDocument()
    expect(await screen.findByText('Grounded chat')).toBeInTheDocument()
  })

  it('navigates between sections', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Library' }))
    expect(await screen.findByRole('heading', { name: 'Documents' })).toBeInTheDocument()
    expect((await screen.findAllByText('lecture.pdf')).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Quizzes' }))
    expect(await screen.findByText('Quiz generation unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reports' }))
    expect(await screen.findByText('Study reports unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(await screen.findByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('VITE_API_BASE_URL')).toBeInTheDocument()
  })

  it('shows the honest unavailable state when chat is called', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = await screen.findByLabelText('Message')
    await waitFor(() => expect(input).not.toBeDisabled())
    await user.type(input, 'What is chapter one?')
    await user.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText(/Chat is not available yet/)).toBeInTheDocument()
  })
})
