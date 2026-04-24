import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, AnimatePresence } from 'framer-motion'

const NAV = [
  { label: 'WORK', href: '/#work' },
  { label: 'ABOUT', href: '/#about' },
  { label: 'SERVICES', href: '/#services' },
  { label: 'CONTACT', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActive] = useState('')
  const { scrollYProgress } = useScroll()
  const loc = useLocation()
  const isChat = loc.pathname === '/chat'
  const scrollRaf = useRef(0)
  const scrollPending = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (scrollPending.current) return
      scrollPending.current = true
      scrollRaf.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50)
        scrollPending.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(scrollRaf.current)
    }
  }, [])

  useEffect(() => {
    const ids = ['work', 'about', 'services', 'contact']
    const sections = ids.map(id => document.getElementById(id))
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => s && obs.observe(s))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleNav = (href) => {
    setOpen(false)
    if (isChat) window.location.href = href
  }

  return (
    <motion.div>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left will-change-transform"
        style={{ scaleX: scrollYProgress, background: 'linear-gradient(90deg, #8B7332, #F59E0B, #8B7332)' }}
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-[2px] w-full z-50 motion-safe:transition-[padding,background-color,box-shadow,border-color,backdrop-filter] motion-safe:duration-500 motion-safe:ease-out ${
          scrolled || open
            ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/[0.04]'
            : 'bg-[#0a0a0a] backdrop-blur-none py-6 border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center gap-3 min-w-0">
          <a href="/#home" className="flex items-baseline font-display text-xl sm:text-2xl font-semibold tracking-wide group shrink-0">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              Zivon
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 200 }}
              className="text-gold text-2xl sm:text-3xl font-bold inline-block group-hover:scale-110 transition-transform duration-500"
              style={{ textShadow: '0 0 16px rgba(245,158,11,0.4), 0 0 32px rgba(245,158,11,0.15)' }}
            >
              X
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1 }} className="text-gold">.</motion.span>
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex gap-8">
              {NAV.map(n => {
                const isActive = activeSection === n.href.replace('/#', '')
                return (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => handleNav(n.href)}
                    className={`text-[13px] tracking-[0.15em] hover:text-white transition-all duration-300 relative py-1 font-body ${isActive ? 'text-white' : 'text-gray-400'}`}
                  >
                    {n.label}
                    <motion.span
                      className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-gold to-gold/30"
                      initial={false}
                      animate={{ width: isActive ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </a>
                )
              })}
              <Link
                to="/chat"
                className="text-[13px] tracking-[0.15em] text-gold hover:text-gold-light transition-colors relative py-1 font-body"
              >
                AI CHAT
                <span className="absolute -top-0.5 -right-2.5 w-1.5 h-1.5 bg-green-400 rounded-full pulse-ring text-green-400" />
              </Link>
            </div>
            <a
              href="/#contact"
              onClick={() => handleNav('/#contact')}
              className="bg-gold text-black px-6 py-2.5 text-[13px] font-semibold hover:bg-gold-light transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] rounded-sm font-body"
            >
              Apply to Work With Us
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gold focus:outline-none"
            aria-label="Toggle menu"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-4 sm:px-6 pt-6 pb-8 flex flex-col gap-3 border-t border-white/[0.04] mt-4">
                {NAV.map((n, i) => (
                  <motion.a
                    key={n.label}
                    href={n.href}
                    onClick={() => handleNav(n.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="text-[13px] tracking-[0.15em] text-gray-300 hover:text-gold transition-colors py-2.5 border-b border-white/[0.03] last:border-0 font-body"
                  >
                    {n.label}
                  </motion.a>
                ))}
                <Link
                  to="/chat"
                  onClick={() => setOpen(false)}
                  className="text-[13px] tracking-[0.15em] text-gold font-semibold py-2.5 font-body"
                >
                  AI CHAT
                </Link>
                <a
                  href="/#contact"
                  onClick={() => handleNav('/#contact')}
                  className="w-full min-h-12 inline-flex items-center justify-center rounded-sm bg-gold text-black px-4 py-3.5 text-base font-semibold hover:bg-gold-light active:scale-[0.99] transition-all duration-300 text-center mt-3 border border-gold-dark/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] font-body"
                >
                  Apply to work with us
                </a>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </motion.div>
  )
}
