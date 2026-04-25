import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatPage from '../components/ChatPage'

vi.mock('framer-motion', () => {
  const React = require('react')
  const motion = new Proxy({}, {
    get: (_t, tag) =>
      ({ children, ...rest }) => {
        const safe = Object.fromEntries(
          Object.entries(rest).filter(([k]) => k === 'className' || k === 'ref')
        )
        return React.createElement(tag, safe, children)
      },
  })
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  }
})

// Stub Navbar to avoid duplicate mocks
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}))

// Stub fetch
beforeEach(() => {
  global.fetch = vi.fn()
})

const renderChat = () =>
  render(
    <MemoryRouter>
      <ChatPage />
    </MemoryRouter>
  )

describe('ChatPage — welcome screen', () => {
  it('renders the ZivonX logo text', () => {
    renderChat()
    expect(screen.getByText('Zivon')).toBeInTheDocument()
  })

  it('renders the AI Assistant label', () => {
    renderChat()
    expect(screen.getByText(/AI Assistant/i)).toBeInTheDocument()
  })

  it('renders all four quick-card buttons', () => {
    renderChat()
    expect(screen.getByText(/What services does Zivonx offer/i)).toBeInTheDocument()
    expect(screen.getByText(/What results have you delivered/i)).toBeInTheDocument()
    expect(screen.getByText(/How does pricing work/i)).toBeInTheDocument()
    expect(screen.getByText(/How do I get started/i)).toBeInTheDocument()
  })

  it('renders the message input', () => {
    renderChat()
    expect(screen.getByPlaceholderText(/Ask about Zivonx/i)).toBeInTheDocument()
  })

  it('renders the Send button', () => {
    renderChat()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('Send button is disabled when input is empty', () => {
    renderChat()
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn).toBeDisabled()
  })

  it('Send button becomes enabled when user types', () => {
    renderChat()
    const input = screen.getByPlaceholderText(/Ask about Zivonx/i)
    fireEvent.change(input, { target: { value: 'Hello' } })
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn).not.toBeDisabled()
  })
})

describe('ChatPage — layout', () => {
  it('renders the navbar placeholder', () => {
    renderChat()
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
  })

  it('renders the Zivonx AI status label', () => {
    renderChat()
    expect(screen.getAllByText(/Zivonx AI/i).length).toBeGreaterThan(0)
  })

  it('renders the powered-by footer', () => {
    renderChat()
    expect(screen.getByText(/Powered by Zivonx AI/i)).toBeInTheDocument()
  })
})
