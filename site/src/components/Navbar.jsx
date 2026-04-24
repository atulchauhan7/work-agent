import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { label: 'Home', href: '/#home' },
  { label: 'Services', href: '/#services' },
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/#work' },
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
          Zivon<span className="text-gold">X</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => handleNav(n.href)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/chat"
            className="text-sm font-semibold text-gold hover:text-gold-light transition-colors"
          >
            AI CHAT
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-bg/95 backdrop-blur-xl border-t border-white/[0.06] px-6 pb-6">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => handleNav(n.href)}
              className="block py-3 text-gray-400 hover:text-white transition-colors border-b border-white/[0.04]"
            >
              {n.label}
            </a>
          ))}
          <Link
            to="/chat"
            onClick={() => setOpen(false)}
            className="block py-3 text-gold font-semibold"
          >
            AI CHAT ✦
          </Link>
        </div>
      )}
    </nav>
  )
}
