import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HomePage from '../components/HomePage'

vi.mock('framer-motion', () => {
  const React = require('react')
  const motion = new Proxy({}, {
    get: (_t, tag) =>
      ({ children, animate, initial, exit, transition, whileInView, viewport, variants, ...rest }) =>
        React.createElement(tag, rest, children),
  })
  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useInView: () => true,
  }
})

vi.mock('../components/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }))
vi.mock('../components/Footer', () => ({ default: () => <footer data-testid="footer" /> }))

const renderHome = () =>
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  )

describe('HomePage — hero', () => {
  it('renders headline words', () => {
    renderHome()
    expect(screen.getByText('We')).toBeInTheDocument()
    expect(screen.getByText('Build')).toBeInTheDocument()
    expect(screen.getByText('Brands')).toBeInTheDocument()
    expect(screen.getByText('Revenue.')).toBeInTheDocument()
  })

  it('renders the hero subtitle about ₹50L+', () => {
    renderHome()
    expect(screen.getByText(/₹50L\+/)).toBeInTheDocument()
  })

  it('renders both CTA buttons', () => {
    renderHome()
    expect(screen.getByRole('link', { name: /See our work/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Check availability/i })).toBeInTheDocument()
  })
})

describe('HomePage — stats', () => {
  it('renders all 4 stat labels', () => {
    renderHome()
    expect(screen.getByText(/Revenue Generated/i)).toBeInTheDocument()
    expect(screen.getByText(/Blended ROAS Range/i)).toBeInTheDocument()
    expect(screen.getAllByText(/CAC Reduction/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Daily Orders/i).length).toBeGreaterThan(0)
  })
})

describe('HomePage — services', () => {
  it('renders Performance Marketing card', () => {
    renderHome()
    expect(screen.getByText('Performance Marketing')).toBeInTheDocument()
  })

  it('renders all 5 service titles', () => {
    renderHome()
    expect(screen.getByText('Paid Social & Search')).toBeInTheDocument()
    expect(screen.getByText('Brand Strategy')).toBeInTheDocument()
    expect(screen.getByText('Creative & Content')).toBeInTheDocument()
    expect(screen.getByText('Website Optimisation')).toBeInTheDocument()
  })
})

describe('HomePage — why us', () => {
  it('renders all three differentiator headings', () => {
    renderHome()
    expect(screen.getByText('We Go Deep, Not Wide')).toBeInTheDocument()
    expect(screen.getByText('Work Directly With Founders')).toBeInTheDocument()
    expect(screen.getByText(/We Optimize for Profit/i)).toBeInTheDocument()
  })
})

describe('HomePage — case study', () => {
  it('renders the case study brand name', () => {
    renderHome()
    expect(screen.getAllByText(/Dhirai/i).length).toBeGreaterThan(0)
  })

  it('renders key result metrics', () => {
    renderHome()
    expect(screen.getByText('340%')).toBeInTheDocument()
    expect(screen.getByText('5.2x')).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
  })
})

describe('HomePage — contact', () => {
  it('renders the contact section heading', () => {
    renderHome()
    expect(screen.getByText(/Pick a time that works/i)).toBeInTheDocument()
  })

  it('renders the name field', () => {
    renderHome()
    expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument()
  })
})

describe('HomePage — team', () => {
  it('renders all three team members', () => {
    renderHome()
    expect(screen.getByText('Dinesh Yelle')).toBeInTheDocument()
    expect(screen.getByText('Atul Chauhan')).toBeInTheDocument()
    expect(screen.getByText('Ritesh Y.')).toBeInTheDocument()
  })
})
