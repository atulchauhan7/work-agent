import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

/* ─── Word-by-word reveal (matches original Hero) ─── */
const WordReveal = ({ words, delay = 0 }) => (
  <span className="inline-flex flex-wrap gap-x-[0.25em]">
    {words.map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 22, rotateX: -12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.58, delay: delay + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
        className="inline-block"
        style={{ transformOrigin: 'bottom center' }}
      >
        {word}
      </motion.span>
    ))}
  </span>
)

/* ─── Char-by-char section label (matches original) ─── */
const CharReveal = ({ text, delay = 0, center = false, withLine = false }) => (
  <motion.p
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    className={`text-gold text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.3em] font-medium uppercase mb-4 sm:mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 max-w-full ${center ? 'justify-center' : ''}`}
  >
    {withLine && <span className="w-6 sm:w-8 h-[1px] bg-gold flex-shrink-0" />}
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        variants={{
          hidden: { opacity: 0, y: 6 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: delay + i * 0.03 } },
        }}
        className="inline-block"
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </motion.p>
)

/* ─── Animated counter (matches original SocialProof) ─── */
const Counter = ({ target, prefix, suffix, isStatic, staticVal, duration = 1800 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current || isStatic) return
    started.current = true
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(eased * target)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration, isStatic])

  const display = isStatic ? staticVal : `${prefix}${Math.floor(count)}${suffix}`

  return (
    <span ref={ref} className="text-3xl sm:text-4xl md:text-5xl font-display text-gold mb-1 font-medium block tabular-nums">
      {display}
    </span>
  )
}

/* ─── Data ─── */

const SERVICES = [
  { title: 'Performance Marketing', desc: 'Data-driven campaigns focused on scaling revenue profitably. We manage Meta & Google Ads with a focus on ROAS, CAC, and LTV optimization.', features: ['ROAS-focused campaign scaling', 'Funnel optimization (TOF, MOF, BOF)', 'Weekly performance reporting'] },
  { title: 'Paid Social & Search', desc: 'Full-funnel ad execution across Meta & Google with continuous A/B testing and budget optimization.', features: ['Creative testing (10–20 variations/week)', 'Audience & pixel optimization', 'Budget scaling without performance drop'] },
  { title: 'Brand Strategy', desc: 'We craft positioning, messaging, and brand identity that makes your brand stand out and convert.', features: ['Competitor & market research', 'Brand positioning & USP', 'Customer persona development'] },
  { title: 'Creative & Content', desc: 'High-converting creatives designed for performance — from UGC to ad creatives that drive sales.', features: ['UGC & ad video production', 'Scroll-stopping hooks & scripts', 'Performance-based creative iteration'] },
  { title: 'Website Optimisation', desc: 'We audit, redesign, and optimise your landing pages and store for speed, UX, and conversion — turning more visitors into buyers.', features: ['CRO audits & A/B testing', 'Page speed & Core Web Vitals', 'Landing page redesign for higher CVR'], tag: 'New' },
]

const WHY_US = [
  { title: 'Focus & Attention', subtitle: 'We Go Deep, Not Wide', desc: 'We partner with only 2–3 brands at a time so we can focus on what actually moves revenue — not just manage accounts.', bullets: ['Daily campaign monitoring', 'Weekly growth strategy calls', 'Full-funnel optimization'] },
  { title: 'Founder-Led Execution', subtitle: 'Work Directly With Founders', desc: 'No account managers. No juniors. You work directly with the people building and scaling brands every day.', bullets: ['Direct WhatsApp/Slack access', 'Fast decision making', 'Zero communication gaps'] },
  { title: 'Revenue First Approach', subtitle: 'We Optimize for Profit, Not Vanity Metrics', desc: "We don't chase impressions or clicks. Every decision is based on revenue, ROAS, and long-term profitability.", bullets: ['ROAS & CAC focused campaigns', 'Data-backed scaling', 'No fluff reporting'] },
]

const STATS = [
  { value: 3, suffix: 'Cr+', prefix: '₹', label: 'Revenue Generated', context: 'Across active client accounts' },
  { value: 5, suffix: 'X', prefix: '3–', label: 'Blended ROAS Range', context: 'Consistent across campaigns', static: '3–5X' },
  { value: 40, suffix: '%+', prefix: '', label: 'CAC Reduction', context: 'Achieved within 60 days' },
  { value: 100, suffix: '+', prefix: '', label: 'Daily Orders', context: 'For our flagship D2C client' },
]

const TEAM = [
  { initial: 'D', name: 'Dinesh Yelle', role: 'CEO', bio: 'Drives the vision, strategy, and marketing engine. The D2C growth brain behind every brand we scale.', color: 'from-amber-900/30 to-transparent' },
  { initial: 'A', name: 'Atul Chauhan', role: 'CTO', bio: 'Leads tech — websites, AI systems, landing pages, and conversion-focused development that drives revenue.', color: 'from-gold/10 to-transparent' },
  { initial: 'R', name: 'Ritesh Y.', role: 'CSO', bio: 'Owns the sales pipeline and client acquisition. Turns conversations into partnerships and partnerships into results.', color: 'from-amber-900/20 to-transparent' },
]

const BRANDS = [
  { name: 'Gulaab Gali', logo: '/gulaab-gali.png' },
  { name: 'Dhirai', logo: '/dhirai.avif' },
  { name: 'Sakhiyaan', logo: '/sakhiyaan.webp' },
]

const CASE_RESULTS = [
  { metric: '340%', label: 'Revenue Growth', sub: 'Month 1 → Month 6' },
  { metric: '5.2x', label: 'Blended ROAS', sub: 'Across Meta & Google' },
  { metric: '42%', label: 'CAC Reduction', sub: 'Within first 60 days' },
  { metric: '100+', label: 'Orders / Day', sub: 'Consistent 4+ months' },
]

const allMarqueeClients = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS]

export default function HomePage() {
  const [marqueePaused, setMarqueePaused] = useState(false)

  return (
    <div className="min-h-screen bg-dark-bg text-white font-body selection:bg-gold-light/30 selection:text-gold-light relative overflow-x-hidden">

      {/* Ambient shapes: CSS animations */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="ambient-blob ambient-blob--a absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-gold/5 rounded-full blur-[120px]" />
        <div className="ambient-blob ambient-blob--b absolute top-[40%] -left-[15%] w-[40vw] h-[40vw] bg-amber-600/5 rounded-full blur-[100px]" />
        <div className="ambient-blob ambient-blob--c absolute -bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 font-body min-w-0 max-w-full">
        <Navbar />

        {/* ─── HERO ─── */}
        <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-x-clip overflow-y-visible border-b border-white/10 min-w-0 scroll-mt-24">
          <div className="absolute top-1/4 right-[10%] w-32 h-32 md:w-64 md:h-64 border border-white/5 rotate-45 pointer-events-none" />
          <div className="absolute top-1/3 left-[-5%] w-48 h-48 md:w-96 md:h-96 border border-white/5 rounded-full blur-3xl opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full min-w-0 relative z-10 py-16 md:pb-24">
            <div className="max-w-4xl min-w-0">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-gold text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] font-medium uppercase mb-4 sm:mb-6"
              >
                Performance-Driven Growth Partner
              </motion.p>

              <h1 className="font-display text-[clamp(1.85rem,6vw,2.25rem)] sm:text-5xl md:text-7xl lg:text-8xl leading-[1.12] sm:leading-[1.15] mb-6 sm:mb-8 text-white overflow-x-clip break-words">
                <div><WordReveal words={['We', 'Build', 'Brands']} delay={0.2} /></div>
                <div>
                  <WordReveal words={['That']} delay={0.5} />{' '}
                  <motion.span
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.58, delay: 0.58, ease: [0.25, 0.1, 0.25, 1] }}
                    className="italic text-gold font-light inline-block"
                  >
                    Print
                  </motion.span>
                </div>
                <div><WordReveal words={['Revenue.']} delay={0.75} /></div>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.95, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-gray-400 text-base sm:text-lg md:text-xl font-light max-w-xl mb-4 leading-relaxed"
              >
                ₹50L+ in client revenue managed monthly. Two partnerships. Zero wasted spend. We don't do average.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.12, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 sm:mb-12 text-[10px] sm:text-xs text-gray-500 font-medium tracking-widest uppercase"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                  2 spots open for Q3
                </span>
                <span className="text-gray-700">·</span>
                <span>Meta &amp; Google Certified</span>
                <span className="text-gray-700 hidden sm:inline">·</span>
                <span className="hidden sm:inline">Bangalore-based</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 1.22, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-full"
              >
                <a href="#work" className="w-full sm:w-auto min-h-12 sm:min-h-0 inline-flex items-center justify-center rounded-sm bg-gold hover:bg-gold-light text-black px-6 sm:px-8 py-3.5 text-center font-semibold transition-colors duration-300 text-base border border-gold-dark/20">
                  See our work
                </a>
                <a href="#contact" className="w-full sm:w-auto min-h-12 sm:min-h-0 inline-flex items-center justify-center rounded-sm border border-gold text-gold hover:bg-gold/10 px-6 sm:px-8 py-3.5 text-center font-semibold transition-colors duration-300 text-base">
                  Check availability
                </a>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] tracking-[0.3em] text-gray-600 uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-px h-6 sm:h-8 bg-gradient-to-b from-gray-600 to-transparent"
            />
          </motion.div>
        </section>

        {/* ─── CLIENT MARQUEE ─── */}
        <section className="py-10 sm:py-14 bg-[#0a0a0a] border-b border-white/10 overflow-x-clip overflow-y-visible relative w-full max-w-full min-w-0">
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0a0a0a, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #0a0a0a, transparent)' }} />
          <p className="text-center text-[10px] tracking-[0.35em] text-gray-600 uppercase font-medium mb-6 sm:mb-8">Brands We've Scaled</p>
          <div
            className="flex marquee-track"
            style={{ animation: 'marquee 32s linear infinite', animationPlayState: marqueePaused ? 'paused' : 'running' }}
            onMouseEnter={() => setMarqueePaused(true)}
            onMouseLeave={() => setMarqueePaused(false)}
          >
            {allMarqueeClients.map((client, i) => (
              <div key={i} className="flex items-center justify-center mx-6 sm:mx-10 flex-shrink-0" style={{ minWidth: '110px' }}>
                <div className="flex flex-col items-center gap-2 sm:gap-3 group cursor-pointer">
                  <div className="w-20 sm:w-28 h-12 sm:h-16 flex items-center justify-center rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <img src={client.logo} alt={client.name} className="max-w-[70px] sm:max-w-[90px] max-h-9 sm:max-h-12 object-contain transition-all duration-300" style={{ filter: 'brightness(0) invert(1)', opacity: marqueePaused ? 0.7 : 0.45 }} />
                  </div>
                  <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-600 uppercase font-medium group-hover:text-gold transition-colors duration-300">{client.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SOCIAL PROOF / STATS ─── */}
        <section className="py-12 sm:py-20 bg-dark-bg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 min-w-0">
              {STATS.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-start justify-center p-4 sm:p-8 bg-dark-bg min-w-0 overflow-hidden"
                >
                  <Counter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} isStatic={!!stat.static} staticVal={stat.static} />
                  <p className="text-white text-[10px] sm:text-xs tracking-[0.08em] sm:tracking-[0.15em] uppercase font-bold mb-1 leading-tight break-words hyphens-auto">
                    {stat.label}
                  </p>
                  <p className="text-gray-600 text-[10px] sm:text-[11px] font-light italic leading-snug break-words">
                    {stat.context}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section id="services" className="scroll-mt-24 py-16 sm:py-24 md:py-32 bg-dark-bg relative border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 sm:mb-20">
              <CharReveal text="What We Do" />
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-display">Services</h2>
            </motion.div>

            {/* First 4 services: 2x2 grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {SERVICES.slice(0, 2).map((s, i) => (
                <ServiceCard key={i} service={s} index={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {SERVICES.slice(2, 4).map((s, i) => (
                <ServiceCard key={i + 2} service={s} index={i + 2} />
              ))}
            </div>

            {/* 5th service: full-width featured */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5 }}
              className="bg-dark-card border border-gold/20 p-6 sm:p-8 lg:p-10 hover:shadow-[0_0_40px_rgba(245,158,11,0.08)] hover:border-gold/40 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-5 sm:mb-6">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    <span className="text-[10px] tracking-[0.2em] font-bold uppercase bg-gold/15 text-gold px-2 py-0.5 border border-gold/30">{SERVICES[4].tag}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 font-medium group-hover:text-gold transition-colors duration-300">{SERVICES[4].title}</h3>
                  <p className="text-gray-400 font-light leading-relaxed text-sm sm:text-base">{SERVICES[4].desc}</p>
                </div>
                <div>
                  <ul className="space-y-3">
                    {SERVICES[4].features.map((f, idx) => (
                      <li key={idx} className="flex items-start text-sm sm:text-[14px] text-gray-300 font-light">
                        <span className="text-gold mr-3 mt-0.5 opacity-70 flex-shrink-0">✦</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-500 font-light italic">Faster sites convert more. A 1-second delay costs up to 7% in conversions.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── WHY US ─── */}
        <section id="about" className="scroll-mt-24 py-16 sm:py-24 md:py-32 bg-[#0a0a0a] relative border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-12 sm:mb-20 text-center max-w-3xl mx-auto">
              <CharReveal text="Why Us" center />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-4 sm:mb-6 leading-tight break-words px-1">Not Another Agency. A Revenue Partner.</h2>
              <p className="text-gray-400 font-light leading-relaxed text-base sm:text-lg">
                We work with a small number of D2C brands to scale revenue profitably through ads, creatives, and strategy.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-20">
              {WHY_US.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 32, rotate: 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-dark-bg p-6 sm:p-8 lg:p-10 border border-white/5 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.07)] hover:border-white/20 transition-all duration-500 flex flex-col"
                >
                  <p className="text-gold text-[10px] sm:text-xs tracking-[0.2em] font-bold uppercase mb-2">{reason.title}</p>
                  <h3 className="text-xl sm:text-2xl font-display mb-4 sm:mb-5 font-medium">{reason.subtitle}</h3>
                  <p className="text-gray-400 font-light leading-relaxed text-sm mb-6">{reason.desc}</p>
                  <div className="mt-auto">
                    <ul className="space-y-2 sm:space-y-3">
                      {reason.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-[14px] text-gray-300 font-light">
                          <span className="text-gold mr-2 sm:mr-3 mt-0.5 opacity-70 flex-shrink-0">✦</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Revenue highlight box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center p-6 sm:p-8 lg:p-12 border border-white/5 bg-dark-bg hover:border-gold/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.05)] transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display text-white relative z-10 font-medium leading-snug">
                We've already helped brands scale to <span className="text-gold italic font-light">₹3Cr+</span> in revenue with consistent <span className="text-gold italic font-light">100+ daily orders</span> — and we're just getting started.
              </h3>
            </motion.div>
          </div>
        </section>

        {/* ─── CASE STUDY ─── */}
        <section id="work" className="scroll-mt-24 py-16 sm:py-24 md:py-32 bg-dark-bg relative overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] border border-gold/5 rounded-full blur-3xl opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 min-w-0">
            {/* Client logos */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 sm:mb-16">
              <p className="text-[10px] tracking-[0.35em] text-gray-600 uppercase font-medium mb-4 sm:mb-6">Brands We've Worked With</p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {BRANDS.map((client, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-2 sm:gap-3 border border-white/8 px-3 sm:px-5 py-2 sm:py-3 hover:border-gold/25 transition-colors duration-300 group"
                  >
                    <img src={client.logo} alt={client.name} className="h-5 sm:h-7 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.5 }} />
                    <span className="text-[10px] sm:text-xs text-gray-500 tracking-widest uppercase group-hover:text-gray-300 transition-colors duration-300">{client.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Case Study Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-dark-card border border-white/10 p-5 sm:p-8 md:p-12 lg:p-20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
                <div>
                  <CharReveal text="Featured Case Study" delay={0.1} withLine />
                  <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-medium leading-[1.15] mb-3 break-words">
                    Scaling a Premium D2C Brand to Profitable Growth
                  </h2>
                  <p className="text-gray-500 text-sm font-light mb-6 sm:mb-8 italic">Dhirai · D2C Fashion &amp; Lifestyle · Bangalore · 2024</p>
                  <p className="text-gray-400 leading-relaxed font-light mb-6 sm:mb-8 text-sm sm:text-base">
                    We partnered with Deepak Meena, founder of Dhirai, when the brand was struggling with inconsistent sales and high CAC. By rebuilding their funnel and focusing on performance-driven creatives, we turned it into a predictable revenue engine.
                  </p>

                  {/* Quote */}
                  <div className="bg-white/3 border border-white/8 p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="text-gold text-2xl sm:text-3xl font-display leading-none mb-2 sm:mb-3 opacity-50">"</div>
                    <p className="text-gray-300 italic font-light leading-relaxed text-sm mb-3 sm:mb-4">
                      The ZivonX team didn't just manage our ads — they rebuilt our entire growth engine. CAC dropped 42% in the first 60 days and we've maintained profitability every month since.
                    </p>
                    <div className="flex items-center gap-3">
                      <img src="/dhirai.avif" alt="Dhirai" className="h-6 sm:h-8 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.6 }} />
                      <div>
                        <p className="text-white text-xs font-medium">Deepak Meena</p>
                        <p className="text-gray-500 text-[11px]">Founder, Dhirai</p>
                      </div>
                    </div>
                  </div>

                  {/* What we did */}
                  <div className="mb-6 sm:mb-8">
                    <p className="text-gold text-[10px] sm:text-xs tracking-[0.2em] font-bold uppercase mb-3 sm:mb-4">What We Did</p>
                    <ul className="space-y-2 sm:space-y-3">
                      {['Rebuilt the ad account structure from scratch', 'Introduced high-AOV bundles to increase order value', 'Scaled winning creatives through aggressive testing', 'Optimized full funnel (TOF → Retargeting → Conversion)'].map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-[14px] text-gray-300 font-light">
                          <span className="text-gold mr-2 sm:mr-3 mt-0.5 opacity-70 flex-shrink-0">✦</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href="#contact" className="inline-flex items-center gap-2 text-white font-medium hover:text-gold transition-colors duration-300 group/btn text-sm sm:text-base">
                    Request Full Case Study
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>

                {/* Results grid */}
                <div className="grid grid-cols-2 gap-px bg-white/10 min-w-0">
                  {CASE_RESULTS.map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
                      className="p-4 sm:p-8 bg-dark-bg flex flex-col justify-center min-w-0"
                    >
                      <span className="text-xl sm:text-3xl md:text-4xl font-display text-gold mb-1 block tabular-nums break-all sm:break-normal">{stat.metric}</span>
                      <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-white font-bold mb-1 leading-tight">{stat.label}</span>
                      <span className="text-[10px] sm:text-[11px] text-gray-600 font-light italic">{stat.sub}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── ABOUT / TEAM ─── */}
        <section className="py-16 sm:py-24 bg-[#050505] relative overflow-hidden border-b border-white/10">
          <div className="absolute top-0 right-0 w-1/3 h-full border-l border-white/5 hidden lg:block" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
              {/* Left: Story */}
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                <CharReveal text="The Origin" delay={0.1} withLine />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium leading-[1.2] mb-6 sm:mb-8 break-words">
                  We built the agency <br className="hidden sm:block" />
                  we wished we could hire.
                </h2>
                <div className="space-y-5 sm:space-y-6 text-gray-400 font-light leading-relaxed mb-8 sm:mb-12 text-sm sm:text-base">
                  <p>We started Zivonx because we were tired of agencies that vanish after onboarding. The bait-and-switch. The monthly reports that hide bad numbers behind vanity metrics.</p>
                  <p>Our philosophy is simple: Every rupee you spend is tracked, optimized, and reported with complete transparency. We treat your ad budget like our own.</p>
                  <p className="text-white border-l-2 border-gold pl-4 sm:pl-6 py-2 text-base sm:text-lg">
                    Based in Bangalore.<br />Scaling brands across India.
                  </p>
                </div>
              </motion.div>

              {/* Right: Team */}
              <div>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-gold text-[10px] sm:text-xs tracking-[0.3em] font-medium uppercase mb-4 sm:mb-6">
                  The Team
                </motion.p>
                <div className="space-y-3 sm:space-y-4">
                  {TEAM.map((founder, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 30, rotate: 1 }}
                      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-dark-card border border-white/8 p-4 sm:p-5 flex gap-3 sm:gap-4 hover:border-gold/20 transition-colors duration-300 group relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${founder.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/25 transition-colors duration-300 relative z-10">
                        <span className="font-display text-gold text-base sm:text-lg font-bold">{founder.initial}</span>
                      </div>
                      <div className="flex-1 relative z-10 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="min-w-0 flex-1 pr-2">
                            <h3 className="mb-0.5 text-white font-medium text-sm truncate">{founder.name}</h3>
                            <p className="text-gold text-[10px] tracking-[0.15em] uppercase font-medium">{founder.role}</p>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs font-light leading-relaxed mt-1">{founder.bio}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Talk to us CTA */}
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.35 }}
                    className="border border-white/5 p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-2 min-w-0"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium mb-0.5">Talk directly to us</p>
                      <p className="text-gray-500 text-xs font-light">No account managers. Ever.</p>
                    </div>
                    <a href="#contact" className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 rounded-sm bg-gold/10 border border-gold/35 text-gold text-sm font-semibold hover:bg-gold hover:text-black hover:border-gold transition-colors px-4 py-3 sm:py-2 sm:px-4 flex-shrink-0 sm:ml-3">
                      Apply now
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </a>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact" className="scroll-mt-24 border-b border-white/10 bg-dark-card py-16 sm:py-20 md:py-32 min-w-0 [color-scheme:dark]">
          <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 md:gap-16 md:px-12 lg:grid-cols-12 lg:gap-10">
            {/* Left info */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:col-span-5"
            >
              <CharReveal text="Book a Session" delay={0.08} withLine />
              <h2 className="mb-4 font-display text-3xl font-medium leading-[1.12] text-white sm:text-4xl lg:text-5xl break-words">
                Pick a time that works for you.
              </h2>
              <p className="mb-6 max-w-md font-light text-base leading-relaxed text-gray-400 sm:text-lg">
                Share your details and preferred slot. We will confirm by email and follow up on WhatsApp if needed.
              </p>
              <p className="mb-8 max-w-md text-sm font-light text-gray-500">
                Direct inbox:{' '}
                <a href="mailto:brandteam@zivonx.com?subject=Book%20a%20session" className="text-gold underline-offset-2 transition-colors hover:text-gold-light hover:underline">
                  brandteam@zivonx.com
                </a>
              </p>
              <ul className="space-y-4 border-l border-gold/25 pl-5 text-sm font-light text-gray-500">
                <li className="text-white/90"><span className="font-medium text-gold">30 min</span> strategy call</li>
                <li>No obligation — we map fit and next steps.</li>
                <li>Slots shown in your local time.</li>
              </ul>
            </motion.div>

            {/* Right form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative min-w-0 lg:col-span-7"
            >
              <div className="absolute -inset-px rounded-sm bg-gradient-to-br from-gold/20 via-transparent to-gold/10 opacity-60 blur-sm" aria-hidden />
              <div className="relative overflow-visible rounded-sm border border-white/10 bg-dark-bg p-6 shadow-[0_0_0_1px_rgba(245,158,11,0.06)] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-amber-600/10 blur-3xl" aria-hidden />

                <form
                  action="https://formsubmit.co/brandteam@zivonx.com"
                  method="POST"
                  className="relative z-10 space-y-6"
                >
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_next" value="https://zivonx.com/#contact" />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Full name</label>
                      <input name="name" required placeholder="Your name" autoComplete="name" className="w-full min-w-0 rounded-sm border border-white/12 bg-dark-card/50 px-4 py-3.5 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/25" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Email</label>
                      <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" className="w-full min-w-0 rounded-sm border border-white/12 bg-dark-card/50 px-4 py-3.5 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/25" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">WhatsApp</label>
                      <input name="whatsapp" type="tel" placeholder="+91 00000 00000" autoComplete="tel" className="w-full min-w-0 rounded-sm border border-white/12 bg-dark-card/50 px-4 py-3.5 font-light text-white placeholder:text-gray-600 transition-[border-color,box-shadow] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/25" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Preferred date</label>
                      <input name="date" type="date" required className="w-full min-w-0 rounded-sm border border-white/12 bg-dark-card/50 px-4 py-3.5 font-light text-white transition-[border-color,box-shadow] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/25" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Preferred time</label>
                      <select name="time" required className="w-full min-w-0 rounded-sm border border-white/12 bg-dark-card/50 px-4 py-3.5 font-light text-white transition-[border-color,box-shadow] focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/25">
                        <option value="">Choose a time</option>
                        <option>10:00 AM</option><option>10:30 AM</option>
                        <option>11:00 AM</option><option>11:30 AM</option>
                        <option>12:00 PM</option><option>12:30 PM</option>
                        <option>2:00 PM</option><option>2:30 PM</option>
                        <option>3:00 PM</option><option>3:30 PM</option>
                        <option>4:00 PM</option><option>4:30 PM</option>
                        <option>5:00 PM</option><option>5:30 PM</option>
                        <option>6:00 PM</option><option>6:30 PM</option>
                        <option>7:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-center text-xs font-light italic text-gray-600">
                    30 min strategy call · No obligation · Slots shown in your local time
                  </p>

                  <button type="submit" className="w-full rounded-sm border border-gold-dark/30 bg-gold py-4 text-base font-semibold text-black shadow-sm transition-[background-color,transform,opacity] hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg">
                    Submit application
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* WhatsApp FAB */}
        <a
          href="https://wa.me/919664412018"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-[45] flex h-14 w-14 items-center justify-center rounded-full border border-gold-dark/40 bg-gradient-to-br from-gold to-gold-dark text-black shadow-[0_8px_28px_rgba(245,158,11,0.35)] ring-2 ring-gold/30 transition-[transform,box-shadow,background-color] duration-300 hover:scale-105 hover:from-gold-light hover:to-gold hover:shadow-[0_10px_36px_rgba(245,158,11,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-dark-bg sm:bottom-8 sm:right-8"
          aria-label="Message us on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-black" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>

        <Footer />
      </div>
    </div>
  )
}

/* ─── Service Card Component ─── */
function ServiceCard({ service, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="bg-dark-card border border-white/5 p-6 sm:p-8 lg:p-10 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.07)] hover:border-white/20 transition-all duration-500 group flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-500 ease-out" />
      <div>
        <h3 className="text-xl sm:text-2xl font-display mb-3 sm:mb-4 font-medium tracking-wide group-hover:text-gold transition-colors duration-300 relative">
          {service.title}
          <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gold group-hover:w-full transition-all duration-500 ease-out block" />
        </h3>
        <p className="text-gray-400 font-light leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base">{service.desc}</p>
      </div>
      <div className="mt-auto">
        <ul className="space-y-2">
          {service.features.map((feature, idx) => (
            <li key={idx} className="flex items-start text-xs sm:text-[13px] text-gray-300 font-light">
              <span className="text-gold mr-2 sm:mr-3 mt-0.5 opacity-70 flex-shrink-0">✦</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
