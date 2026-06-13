import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, AnimatePresence } from 'framer-motion'

const NAV = [
  { label: 'Services', href: '/#services' },
  { label: 'Approach', href: '/#approach' },
  { label: 'Work', href: '/#work' },
  { label: 'About', href: '/#about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollYProgress } = useScroll()
  const raf = useRef(0)
  const pending = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (pending.current) return
      pending.current = true
      raf.current = requestAnimationFrame(() => { setScrolled(window.scrollY > 24); pending.current = false })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf.current) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-5">
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`relative mx-auto flex items-center justify-between rounded-2xl bg-dark text-white ring-1 ring-white/10 transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-w-5xl mt-2 px-3 sm:px-4 py-2 sm:py-2.5 shadow-card' : 'max-w-6xl mt-3 sm:mt-4 px-4 sm:px-5 py-2.5 sm:py-3 shadow-soft'
        }`}
      >
        {/* progress line */}
        <motion.div className="absolute left-0 right-0 bottom-0 h-[2px] origin-left bg-accent/70" style={{ scaleX: scrollYProgress }} />

        {/* logo */}
        <a href="/#home" className="font-display text-[18px] font-semibold tracking-tight shrink-0">
          ZivonX<span className="text-accent">.</span>
        </a>

        {/* center: nav links — desktop only */}
        <nav className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV.map(n => (
            <a key={n.label} href={n.href} className="text-[14px] font-medium text-white/70 hover:text-white px-3.5 py-2 rounded-lg hover:bg-white/[0.08] transition-colors">{n.label}</a>
          ))}
        </nav>

        {/* right: CTA buttons — desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link to="/chat" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/[0.08] transition-colors">
            <span className="w-1.5 h-1.5 bg-accent rounded-full pulse-ring text-accent" /> AI Chat
          </Link>
          <a href="/#contact" className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-white px-4 py-2 text-[14px] font-semibold hover:bg-accent-ink transition-colors">
            Get free audit
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </a>
        </div>

        {/* mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2 -mr-1 shrink-0" aria-label="Toggle menu">
          <div className="w-5 flex flex-col gap-[5px]">
            <motion.span animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} className="h-[2px] w-full bg-white rounded-full block" />
            <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="h-[2px] w-full bg-white rounded-full block" />
            <motion.span animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} className="h-[2px] w-full bg-white rounded-full block" />
          </div>
        </button>
      </motion.div>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mx-auto max-w-6xl mt-2 rounded-2xl bg-dark text-white ring-1 ring-white/10 shadow-card overflow-hidden"
          >
            <div className="p-3">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="block font-display text-lg font-medium text-white/85 px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  {n.label}
                </motion.a>
              ))}
              <Link to="/chat" onClick={() => setOpen(false)} className="flex items-center gap-2 font-display text-lg font-medium text-accent px-3 py-3 rounded-xl hover:bg-white/[0.06] transition-colors">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" /> AI Chat
              </Link>
              <a href="/#contact" onClick={() => setOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent text-white px-4 py-3.5 text-[15px] font-semibold">
                Book a call
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
