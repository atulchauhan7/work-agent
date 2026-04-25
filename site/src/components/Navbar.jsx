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
            ? 'bg-[#080808]/95 backdrop-blur-3xl py-3 shadow-[0_1px_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.6)] border-b border-white/[0.05]'
            : 'bg-[#080808] backdrop-blur-none py-5 border-b border-white/[0.04]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex justify-between items-center gap-3 min-w-0">
          <a href="/#home" className="flex items-baseline font-display text-xl sm:text-2xl font-semibold tracking-wide group shrink-0">
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              Zivon
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 200 }}
              className="text-gold text-2xl sm:text-3xl font-bold inline-block group-hover:scale-110 transition-transform duration-500"
              style={{ textShadow: '0 0 20px rgba(245,158,11,0.5), 0 0 40px rgba(245,158,11,0.2)' }}
            >
              X
            </motion.span>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1 }} className="text-gold/60">.</motion.span>
          </a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-7 items-center">
              {NAV.map(n => {
                const isActive = activeSection === n.href.replace('/#', '')
                return (
                  <a
                    key={n.label}
                    href={n.href}
                    onClick={() => handleNav(n.href)}
                    className={`text-[12px] tracking-[0.18em] hover:text-white transition-all duration-300 relative py-1 font-body font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}
                  >
                    {n.label}
                    <motion.span
                      className="absolute -bottom-0.5 left-0 h-[1.5px] bg-gradient-to-r from-gold to-transparent rounded-full"
                      initial={false}
                      animate={{ width: isActive ? '100%' : '0%' }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </a>
                )
              })}
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] text-gold hover:text-gold-light transition-colors relative py-1 font-body font-semibold"
              >
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full glow-dot text-green-400 flex-shrink-0" />
                AI CHAT
              </Link>
            </div>
            <a
              href="/#contact"
              onClick={() => handleNav('/#contact')}
              className="bg-gold text-black px-5 py-2 text-[12px] tracking-[0.05em] font-bold hover:bg-gold-light transition-all duration-300 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)] rounded-sm font-body"
            >
              Apply →
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300 hover:text-gold transition-colors focus:outline-none p-1"
            aria-label="Toggle menu"
          >
            <motion.div animate={open ? 'open' : 'closed'}>
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </motion.div>
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
              <div className="px-5 sm:px-8 pt-5 pb-8 flex flex-col gap-1 border-t border-white/[0.05] mt-3">
                {NAV.map((n, i) => (
                  <motion.a
                    key={n.label}
                    href={n.href}
                    onClick={() => handleNav(n.href)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="text-sm tracking-[0.1em] text-gray-300 hover:text-white transition-colors py-3 border-b border-white/[0.03] font-body font-medium"
                  >
                    {n.label}
                  </motion.a>
                ))}
                <Link
                  to="/chat"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm tracking-[0.1em] text-gold font-semibold py-3 border-b border-white/[0.03] font-body"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                  AI CHAT
                </Link>
                <a
                  href="/#contact"
                  onClick={() => handleNav('/#contact')}
                  className="w-full min-h-12 inline-flex items-center justify-center rounded-sm bg-gold text-black px-4 py-3.5 text-sm font-bold hover:bg-gold-light active:scale-[0.99] transition-all duration-300 text-center mt-4 font-body"
                >
                  Apply to work with us →
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.div>
  )
}
