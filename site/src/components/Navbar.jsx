import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isChat = loc.pathname === '/chat'

  const handleNav = (href) => {
    setOpen(false)
    if (isChat) {
      window.location.href = href
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/#home" className="text-xl font-heading font-bold text-white tracking-wide">
          Zivon<span className="text-gold">X</span><span className="text-white">.</span>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => handleNav(n.href)}
              className="text-sm uppercase tracking-wide text-gray-400 hover:text-white transition-colors"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/chat"
            className="text-sm uppercase tracking-wide font-semibold text-gold hover:text-gold-light transition-colors"
          >
            AI Chat
          </Link>
          <a
            href="/#contact"
            onClick={() => handleNav('/#contact')}
            className="ml-2 px-5 py-2 text-sm font-semibold bg-gold text-black rounded-lg hover:bg-gold-light transition-colors"
          >
            Apply to Work With Us
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-white text-2xl"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-dark-bg/95 backdrop-blur-xl border-t border-white/[0.06] px-6 pb-6">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => handleNav(n.href)}
              className="block py-3 uppercase tracking-wide text-gray-400 hover:text-white transition-colors border-b border-white/[0.04]"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/chat"
            onClick={() => setOpen(false)}
            className="block py-3 uppercase tracking-wide text-gold font-semibold border-b border-white/[0.04]"
          >
            AI Chat
          </Link>
          <a
            href="/#contact"
            onClick={() => handleNav('/#contact')}
            className="block mt-4 text-center px-5 py-2.5 text-sm font-semibold bg-gold text-black rounded-lg hover:bg-gold-light transition-colors"
          >
            Apply to Work With Us
          </a>
        </div>
      )}
    </nav>
  )
}
