import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loc = useLocation()
  const isChat = loc.pathname === '/chat'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNav = (href) => {
    setOpen(false)
    if (isChat) window.location.href = href
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass border-b border-white/[0.06] shadow-lg shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        <a href="/#home" className="relative text-xl font-heading font-bold text-white tracking-wide group">
          Zivon<span className="text-gradient">X</span><span className="text-white/80">.</span>
        </a>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map(n => (
            <a
              key={n.label}
              href={n.href}
              onClick={() => handleNav(n.href)}
              className="relative px-4 py-2 text-[13px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors duration-300 group"
            >
              {n.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gold rounded-full transition-all duration-300 group-hover:w-5" />
            </a>
          ))}
          <Link
            to="/chat"
            className="relative px-4 py-2 text-[13px] uppercase tracking-widest font-semibold text-gold hover:text-gold-light transition-colors duration-300"
          >
            AI Chat
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </Link>
          <a
            href="/#contact"
            onClick={() => handleNav('/#contact')}
            className="ml-4 px-5 py-2.5 text-[12px] lg:text-[13px] font-semibold bg-gradient-to-r from-gold to-gold-light text-black rounded-lg hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] transition-all duration-300 whitespace-nowrap"
          >
            Apply to Work With Us
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden relative w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${open ? 'rotate-45 translate-y-[5px]' : ''}`} />
            <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${open ? 'opacity-0 scale-0' : ''}`} />
            <span className={`block h-[2px] bg-white rounded-full transition-all duration-300 ${open ? '-rotate-45 -translate-y-[5px]' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed inset-x-0 top-16 bottom-0 glass border-t border-white/[0.06] overflow-y-auto"
          >
            <div className="px-6 py-8 pb-[env(safe-area-inset-bottom,2rem)] space-y-1">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.label}
                  href={n.href}
                  onClick={() => handleNav(n.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="block py-4 text-lg uppercase tracking-widest text-gray-300 hover:text-white hover:pl-2 transition-all border-b border-white/[0.04]"
                >
                  {n.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/chat"
                  onClick={() => setOpen(false)}
                  className="block py-4 text-lg uppercase tracking-widest text-gold font-semibold border-b border-white/[0.04]"
                >
                  AI Chat <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse" />
                </Link>
              </motion.div>
              <motion.a
                href="/#contact"
                onClick={() => handleNav('/#contact')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block mt-6 text-center px-6 py-3.5 text-sm font-semibold bg-gradient-to-r from-gold to-gold-light text-black rounded-xl"
              >
                Apply to Work With Us
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
