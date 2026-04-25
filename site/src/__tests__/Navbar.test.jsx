import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'

// framer-motion stub — avoids jsdom animation errors
vi.mock('framer-motion', () => {
  const React = require('react')
  const motion = new Proxy(
    {},
    {
      get: (_t, tag) =>
        // eslint-disable-next-line react/display-name
        ({ children, ...rest }) => {
          const Tag = tag
          const safe = Object.fromEntries(
            Object.entries(rest).filter(
              ([k]) => !['initial', 'animate', 'exit', 'transition', 'whileInView', 'viewport', 'variants', 'style', 'className'].includes(k) ||
                       k === 'className'
            )
          )
          return React.createElement(Tag, safe, children)
        },
    }
  )
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useInView: () => false,
  }
})

const renderNav = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>
  )

describe('Navbar', () => {
  it('renders the brand name ZivonX', () => {
    renderNav()
    expect(screen.getAllByText(/Zivon/i).length).toBeGreaterThan(0)
  })

  it('renders all primary nav links on desktop', () => {
    renderNav()
    expect(screen.getAllByText('WORK').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ABOUT').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SERVICES').length).toBeGreaterThan(0)
    expect(screen.getAllByText('CONTACT').length).toBeGreaterThan(0)
  })

  it('renders the AI CHAT link', () => {
    renderNav()
    expect(screen.getAllByText('AI CHAT').length).toBeGreaterThan(0)
  })

  it('renders the CTA Apply button', () => {
    renderNav()
    const ctas = screen.getAllByText(/Apply to/i)
    expect(ctas.length).toBeGreaterThan(0)
  })

  it('renders the hamburger toggle on mobile (button present)', () => {
    renderNav()
    const btn = screen.getByRole('button', { name: /toggle menu/i })
    expect(btn).toBeInTheDocument()
  })
})
