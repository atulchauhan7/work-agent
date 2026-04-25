import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

/* ─── Word reveal animation ─── */
const WordReveal = ({ words, delay = 0 }) => (
  <span className="inline-flex flex-wrap gap-x-[0.22em]">
    {words.map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.75, delay: delay + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="inline-block"
      >
        {word}
      </motion.span>
    ))}
  </span>
)

/* ─── Section label ─── */
const Label = ({ text, center = false, delay = 0 }) => (
  <motion.p
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`text-gold text-[10px] tracking-[0.35em] font-bold uppercase mb-4 sm:mb-6 font-body flex items-center gap-3 ${center ? 'justify-center' : ''}`}
  >
    <span className="h-[1px] w-6 bg-gradient-to-r from-gold to-transparent flex-shrink-0" />
    {text}
  </motion.p>
)

/* ─── Animated counter ─── */
const Counter = ({ target, prefix = '', suffix = '', isStatic, staticVal, duration = 1800 }) => {
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

  return (
    <span ref={ref} className="font-display gold-shimmer tabular-nums">
      {isStatic ? staticVal : `${prefix}${Math.floor(count)}${suffix}`}
    </span>
  )
}

/* ─── Data ─── */
const SERVICES = [
  { title: 'Performance Marketing', desc: 'Data-driven campaigns focused on scaling revenue profitably. Meta & Google Ads with a focus on ROAS, CAC, and LTV.', features: ['ROAS-focused campaign scaling', 'Funnel optimization (TOF\u2192BOF)', 'Weekly performance reporting'], icon: '\u2197' },
  { title: 'Paid Social & Search', desc: 'Full-funnel ad execution across Meta & Google with continuous A/B testing and budget optimization.', features: ['Creative testing (10\u201320 variations/week)', 'Audience & pixel optimization', 'Budget scaling without drops'], icon: '\u25ce' },
  { title: 'Brand Strategy', desc: 'Positioning, messaging, and brand identity that makes your brand stand out and convert.', features: ['Competitor & market research', 'Brand positioning & USP', 'Customer persona development'], icon: '\u25c8' },
  { title: 'Creative & Content', desc: 'High-converting creatives designed for performance \u2014 from UGC to ad creatives that drive sales.', features: ['UGC & ad video production', 'Scroll-stopping hooks & scripts', 'Performance-based iteration'], icon: '\u2b21' },
  { title: 'Website Optimisation', desc: 'We audit, redesign, and optimise your landing pages for speed, UX, and conversion.', features: ['CRO audits & A/B testing', 'Page speed & Core Web Vitals', 'Landing page redesign for CVR'], icon: '\u25fb', tag: 'New' },
]

const WHY_US = [
  { num: '01', title: 'Focus & Attention', subtitle: 'We Go Deep, Not Wide', desc: 'We partner with only 2\u20133 brands at a time so we can focus on what actually moves revenue \u2014 not just manage accounts.', bullets: ['Daily campaign monitoring', 'Weekly growth strategy calls', 'Full-funnel optimization'] },
  { num: '02', title: 'Founder-Led Execution', subtitle: 'Work Directly With Founders', desc: 'No account managers. No juniors. You work directly with the people building and scaling brands every day.', bullets: ['Direct WhatsApp/Slack access', 'Fast decision making', 'Zero communication gaps'] },
  { num: '03', title: 'Revenue First Approach', subtitle: 'We Optimize for Profit, Not Vanity Metrics', desc: "We don't chase impressions or clicks. Every decision is based on revenue, ROAS, and long-term profitability.", bullets: ['ROAS & CAC focused campaigns', 'Data-backed scaling', 'No fluff reporting'] },
]

const STATS = [
  { value: 3, suffix: 'Cr+', prefix: '\u20b9', label: 'Revenue Generated', context: 'Across active client accounts' },
  { value: 5, suffix: 'X', prefix: '3\u2013', label: 'Blended ROAS Range', context: 'Consistent across campaigns', static: '3\u20135X' },
  { value: 40, suffix: '%+', prefix: '', label: 'CAC Reduction', context: 'Achieved within 60 days' },
  { value: 100, suffix: '+', prefix: '', label: 'Daily Orders', context: 'For our flagship D2C client' },
]

const TEAM = [
  { initial: 'D', name: 'Dinesh Yelle', role: 'CEO', bio: 'Drives vision, strategy, and the marketing engine. The D2C growth brain behind every brand we scale.' },
  { initial: 'A', name: 'Atul Chauhan', role: 'CTO', bio: 'Leads tech \u2014 websites, AI systems, landing pages, and conversion-focused development.' },
  { initial: 'R', name: 'Ritesh Y.', role: 'CSO', bio: 'Owns the sales pipeline. Turns conversations into partnerships and partnerships into results.' },
]

const BRANDS = [
  { name: 'Gulaab Gali', logo: '/gulaab-gali.png' },
  { name: 'Dhirai', logo: '/dhirai.avif' },
  { name: 'Sakhiyaan', logo: '/sakhiyaan.webp' },
]

const CASE_RESULTS = [
  { metric: '340%', label: 'Revenue Growth', sub: 'Month 1 \u2192 Month 6' },
  { metric: '5.2x', label: 'Blended ROAS', sub: 'Across Meta & Google' },
  { metric: '42%', label: 'CAC Reduction', sub: 'Within first 60 days' },
  { metric: '100+', label: 'Orders / Day', sub: 'Consistent 4+ months' },
]

const allMarqueeClients = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS]

/* ─── Service Card ─── */
function ServiceCard({ service, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-6 sm:p-8 flex flex-col h-full overflow-hidden service-line hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none" />
      <span className="absolute top-4 right-5 text-6xl font-display font-bold text-white/[0.025] pointer-events-none select-none leading-none">0{index + 1}</span>
      <div className="w-10 h-10 rounded-xl bg-gold/[0.06] border border-gold/10 flex items-center justify-center mb-6 flex-shrink-0 group-hover:bg-gold/10 group-hover:border-gold/20 transition-all duration-500">
        <span className="text-gold text-lg font-mono">{service.icon}</span>
      </div>
      <div className="relative z-10 flex flex-col flex-1">
        {service.tag && (
          <span className="inline-block text-[9px] tracking-[0.2em] font-bold uppercase bg-gold/10 text-gold px-2 py-0.5 border border-gold/20 rounded-full mb-3 w-fit">{service.tag}</span>
        )}
        <h3 className="text-lg sm:text-xl font-display font-medium mb-3 group-hover:text-gold transition-colors duration-400 leading-snug">{service.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 font-light">{service.desc}</p>
        <div className="mt-auto pt-5 border-t border-white/[0.05]">
          <ul className="space-y-2">
            {service.features.map((f, idx) => (
              <li key={idx} className="flex items-start text-xs text-gray-400 font-light gap-2.5">
                <span className="text-gold/40 mt-0.5 flex-shrink-0 group-hover:text-gold/70 transition-colors duration-500">\u2726</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const [marqueePaused, setMarqueePaused] = useState(false)

  return (
    <div className="min-h-screen bg-[#080808] text-white font-body relative overflow-x-hidden grain selection:bg-gold/20 selection:text-gold-light">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="ambient-blob ambient-blob--a absolute -top-[20%] -right-[10%] w-[55vw] h-[55vw] bg-gold/[0.035] rounded-full blur-[160px]" />
        <div className="ambient-blob ambient-blob--b absolute top-[40%] -left-[15%] w-[45vw] h-[45vw] bg-amber-700/[0.04] rounded-full blur-[130px]" />
        <div className="ambient-blob ambient-blob--c absolute -bottom-[10%] right-[10%] w-[60vw] h-[60vw] bg-gold/[0.025] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 min-w-0 max-w-full">
        <Navbar />

        {/* HERO */}
        <section id="home" className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 overflow-x-clip scroll-mt-24">
          <div className="absolute inset-0 dot-grid opacity-40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_30%,#080808_80%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 w-full relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8 sm:mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 glow-dot text-green-400 flex-shrink-0" />
              <span className="text-[10px] tracking-[0.2em] text-gray-300 uppercase font-medium font-body">Performance-Driven Growth Partner</span>
            </motion.div>

            <h1 className="font-display text-[clamp(2.6rem,7.5vw,6rem)] sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[1.0] sm:leading-[0.98] mb-7 sm:mb-9 text-white tracking-tight">
              <div className="overflow-hidden"><WordReveal words={['We', 'Build', 'Brands']} delay={0.2} /></div>
              <div className="overflow-hidden mt-1">
                <WordReveal words={['That']} delay={0.5} />
                {' '}
                <motion.span
                  initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.75, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="italic gold-shimmer gold-shimmer-animate font-light inline-block"
                >Print</motion.span>
              </div>
              <div className="overflow-hidden mt-1"><WordReveal words={['Revenue.']} delay={0.82} /></div>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-gray-400 text-base sm:text-lg md:text-xl font-light max-w-lg mb-4 leading-relaxed"
            >
              ₹50L+ in client revenue managed monthly. Two partnerships. Zero wasted spend.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-10 sm:mb-12 text-[10px] text-gray-600 font-medium tracking-widest uppercase font-body"
            >
              <span className="flex items-center gap-2 text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                2 spots open for Q3
              </span>
              <span className="text-white/[0.07]">\u00b7</span>
              <span>Meta & Google Certified</span>
              <span className="text-white/[0.07] hidden sm:inline">\u00b7</span>
              <span className="hidden sm:inline">Bangalore \u00b7 India</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <a href="#work" className="w-full sm:w-auto min-h-12 sm:min-h-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gold hover:bg-gold-light text-black px-8 py-3.5 font-bold transition-all duration-300 text-sm border border-gold-dark/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] tracking-wide">
                See our work
              </a>
              <a href="#contact" className="w-full sm:w-auto min-h-12 sm:min-h-0 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white hover:border-gold/40 hover:text-gold px-8 py-3.5 font-semibold transition-all duration-300 text-sm hover:bg-gold/[0.04] tracking-wide">
                Check availability
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }} className="w-px h-8 sm:h-12 bg-gradient-to-b from-gold/30 to-transparent" />
          </motion.div>
        </section>

        {/* MARQUEE */}
        <section className="py-10 sm:py-14 border-t border-b border-white/[0.04] bg-[#080808] overflow-x-clip relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-36 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-36 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />
          <p className="text-center text-[9px] tracking-[0.4em] text-gray-700 uppercase font-semibold font-body mb-7">Brands We've Scaled</p>
          <div className="flex marquee-track" style={{ animation: 'marquee 22s linear infinite', animationPlayState: marqueePaused ? 'paused' : 'running' }} onMouseEnter={() => setMarqueePaused(true)} onMouseLeave={() => setMarqueePaused(false)}>
            {allMarqueeClients.map((client, i) => (
              <div key={i} className="flex items-center justify-center mx-8 sm:mx-14 flex-shrink-0" style={{ minWidth: '100px' }}>
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <img src={client.logo} alt={client.name} className="max-w-[70px] sm:max-w-[90px] max-h-9 sm:max-h-11 object-contain transition-all duration-500 group-hover:scale-105" style={{ filter: 'brightness(0) invert(1)', opacity: marqueePaused ? 0.5 : 0.25 }} />
                  <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-gray-700 uppercase font-semibold font-body group-hover:text-gray-400 transition-colors duration-500">{client.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS BENTO */}
        <section className="py-16 sm:py-24 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden">
              {STATS.map((stat, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col justify-center p-7 sm:p-10 md:p-12 bg-[#080808] hover:bg-[#0d0d0d] transition-colors duration-500 group">
                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display gold-shimmer mb-2 font-semibold block tabular-nums leading-none">
                    <Counter target={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} isStatic={!!stat.static} staticVal={stat.static} />
                  </span>
                  <p className="text-white text-[9px] sm:text-[10px] tracking-[0.18em] uppercase font-bold mb-1 leading-tight group-hover:text-gold/90 transition-colors duration-400 font-body">{stat.label}</p>
                  <p className="text-gray-600 text-[10px] sm:text-xs font-light italic leading-snug font-body">{stat.context}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider mx-5 sm:mx-8 md:mx-12 max-w-7xl xl:mx-auto" />

        {/* SERVICES */}
        <section id="services" className="scroll-mt-24 py-20 sm:py-28 md:py-36 bg-[#080808] relative">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-14 sm:mb-20">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <Label text="What We Do" />
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.0] tracking-tight">Services</h2>
              </motion.div>
              <motion.p initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="text-gray-500 font-light max-w-xs text-sm leading-relaxed md:text-right">
                Everything a D2C brand needs to scale profitably \u2014 under one roof.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
              {SERVICES.slice(0, 2).map((s, i) => <ServiceCard key={i} service={s} index={i} />)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
              {SERVICES.slice(2, 4).map((s, i) => <ServiceCard key={i + 2} service={s} index={i + 2} />)}
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="bg-[#0d0d0d] border border-gold/15 rounded-2xl p-7 sm:p-10 lg:p-14 hover:border-gold/30 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-14 items-center relative z-10">
                <div>
                  <span className="inline-block text-[9px] tracking-[0.2em] font-bold uppercase bg-gold/10 text-gold px-2.5 py-1 border border-gold/25 rounded-full mb-5">{SERVICES[4].tag}</span>
                  <h3 className="text-2xl sm:text-3xl font-display mb-4 font-medium group-hover:text-gold transition-colors duration-400 leading-snug">{SERVICES[4].title}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm sm:text-base">{SERVICES[4].desc}</p>
                </div>
                <div>
                  <ul className="space-y-3.5">
                    {SERVICES[4].features.map((f, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-300 font-light gap-3">
                        <span className="text-gold/50 flex-shrink-0 mt-0.5">\u2726</span>{f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 pt-6 border-t border-white/[0.05] text-xs text-gray-600 font-light italic">A 1-second delay costs up to 7% in conversions.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="section-divider mx-5 sm:mx-8 md:mx-12 max-w-7xl xl:mx-auto" />

        {/* WHY US */}
        <section id="about" className="scroll-mt-24 py-20 sm:py-28 md:py-36 bg-[#080808] relative">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
              <Label text="Why Us" center />
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium mb-5 leading-tight tracking-tight">
                Not Another Agency.<br className="hidden sm:block" />
                <span className="italic font-light gold-shimmer"> A Revenue Partner.</span>
              </h2>
              <p className="text-gray-500 font-light leading-relaxed text-base max-w-2xl mx-auto">We work with a small number of D2C brands to scale revenue profitably.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10 sm:mb-16">
              {WHY_US.map((reason, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} className="bg-[#0d0d0d] p-7 sm:p-9 border border-white/[0.05] rounded-2xl hover:border-white/[0.1] hover:-translate-y-1.5 transition-all duration-500 flex flex-col group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none" />
                  <span className="text-[80px] sm:text-[100px] font-display font-bold text-white/[0.025] absolute -top-4 -right-2 select-none pointer-events-none leading-none">{reason.num}</span>
                  <p className="text-gold/70 text-[9px] tracking-[0.25em] font-bold uppercase mb-3 font-body">{reason.title}</p>
                  <h3 className="text-lg sm:text-xl font-display mb-4 font-medium leading-snug text-white group-hover:text-gold/90 transition-colors duration-500 relative z-10">{reason.subtitle}</h3>
                  <p className="text-gray-500 font-light leading-relaxed text-sm mb-6 font-body relative z-10">{reason.desc}</p>
                  <div className="mt-auto pt-5 border-t border-white/[0.04] relative z-10">
                    <ul className="space-y-2.5">
                      {reason.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-300 font-normal leading-relaxed font-body gap-2.5">
                          <span className="text-gold/40 mt-0.5 flex-shrink-0 group-hover:text-gold/70 transition-colors duration-500">\u2726</span>{bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center p-8 sm:p-12 border border-white/[0.05] bg-[#0d0d0d] rounded-2xl relative overflow-hidden group hover:border-gold/15 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl" />
              <h3 className="text-xl sm:text-2xl md:text-3xl font-display text-white relative z-10 font-medium leading-snug">
                We've helped brands scale to <span className="gold-shimmer italic font-light">\u20b93Cr+</span> in revenue with consistent <span className="gold-shimmer italic font-light">100+ daily orders</span> \u2014 and we're just getting started.
              </h3>
            </motion.div>
          </div>
        </section>

        <div className="section-divider mx-5 sm:mx-8 md:mx-12 max-w-7xl xl:mx-auto" />

        {/* CASE STUDY */}
        <section id="work" className="scroll-mt-24 py-20 sm:py-28 md:py-36 bg-[#080808] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-gold/[0.03] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.015] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-14 sm:mb-20">
              <Label text="Brands We've Worked With" />
              <div className="flex flex-wrap gap-3">
                {BRANDS.map((client, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex items-center gap-3 border border-white/[0.07] rounded-xl px-5 py-2.5 hover:border-gold/25 hover:bg-gold/[0.03] transition-all duration-500 group">
                    <img src={client.logo} alt={client.name} className="h-5 sm:h-6 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.45 }} />
                    <span className="text-[10px] text-gray-500 tracking-[0.18em] uppercase group-hover:text-gray-300 transition-colors duration-500 font-body">{client.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="bg-[#0d0d0d] border border-white/[0.07] rounded-3xl p-7 sm:p-12 md:p-16 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl pointer-events-none" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-start">
                <div>
                  <Label text="Featured Case Study" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium leading-[1.1] mb-3">Scaling a Premium D2C Brand to Profitable Growth</h2>
                  <p className="text-gray-600 text-sm font-light mb-7 italic">Dhirai \u00b7 D2C Fashion \u00b7 Bangalore \u00b7 2024</p>
                  <p className="text-gray-400 leading-relaxed font-light mb-8 text-sm sm:text-base">We partnered with Deepak Meena, founder of Dhirai, when the brand was struggling with inconsistent sales and high CAC. By rebuilding their funnel and performance-driven creatives, we turned it into a predictable revenue engine.</p>
                  <blockquote className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-7 mb-8 relative">
                    <span className="text-5xl font-display text-gold/15 leading-none absolute top-3 left-5">"</span>
                    <p className="text-gray-300 italic font-light leading-relaxed text-sm mb-4 relative z-10">The ZivonX team didn't just manage our ads \u2014 they rebuilt our entire growth engine. CAC dropped 42% in the first 60 days and we've maintained profitability every month since.</p>
                    <footer className="flex items-center gap-3 relative z-10">
                      <img src="/dhirai.avif" alt="Dhirai" className="h-6 w-auto object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.45 }} />
                      <div>
                        <cite className="not-italic text-white text-xs font-medium">Deepak Meena</cite>
                        <p className="text-gray-600 text-[11px]">Founder, Dhirai</p>
                      </div>
                    </footer>
                  </blockquote>
                  <div className="mb-8">
                    <p className="text-gold text-[9px] tracking-[0.3em] font-bold uppercase mb-4 font-body">What We Did</p>
                    <ul className="space-y-3">
                      {['Rebuilt the ad account structure from scratch','Introduced high-AOV bundles to increase order value','Scaled winning creatives through aggressive testing','Optimized full funnel (TOF \u2192 Retargeting \u2192 Conversion)'].map((item, idx) => (
                        <li key={idx} className="flex items-start text-sm text-gray-300 font-light gap-2.5">
                          <span className="text-gold/40 mt-0.5 flex-shrink-0">\u2726</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a href="#contact" className="inline-flex items-center gap-2 text-white font-medium hover:text-gold transition-all duration-300 group/btn text-sm hover:gap-3">
                    Request Full Case Study
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-px bg-white/[0.07] rounded-2xl overflow-hidden">
                  {CASE_RESULTS.map((stat, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }} className="p-6 sm:p-10 bg-[#0a0a0a] flex flex-col justify-center hover:bg-[#0f0f0f] transition-colors duration-400">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-display gold-shimmer mb-2 block tabular-nums font-semibold">{stat.metric}</span>
                      <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white font-bold mb-1 font-body">{stat.label}</span>
                      <span className="text-[10px] text-gray-600 font-light italic font-body">{stat.sub}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="section-divider mx-5 sm:mx-8 md:mx-12 max-w-7xl xl:mx-auto" />

        {/* TEAM */}
        <section className="py-20 sm:py-28 md:py-36 bg-[#080808]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 sm:gap-20 items-start">
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <Label text="The Origin" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium leading-[1.1] mb-8 tracking-tight">We built the agency<br className="hidden sm:block" /> we wished we could hire.</h2>
                <div className="space-y-6 text-gray-500 font-light leading-relaxed mb-10 text-sm sm:text-base">
                  <p>We started Zivonx because we were tired of agencies that vanish after onboarding \u2014 the bait-and-switch, monthly reports hiding bad numbers behind vanity metrics.</p>
                  <p>Our philosophy: Every rupee is tracked, optimized, and reported with complete transparency. We treat your budget like our own.</p>
                  <blockquote className="text-white border-l-2 border-gold/50 pl-6 py-1 text-base sm:text-lg font-display italic not-italic">Based in Bangalore.<br />Scaling brands across India.</blockquote>
                </div>
              </motion.div>
              <div>
                <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-gold text-[9px] tracking-[0.35em] font-bold uppercase mb-6 font-body">The Team</motion.p>
                <div className="space-y-3">
                  {TEAM.map((founder, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }} className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 sm:p-6 flex gap-4 hover:border-gold/15 transition-all duration-500 group">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/15 flex items-center justify-center flex-shrink-0 group-hover:from-gold/25 group-hover:border-gold/30 transition-all duration-500">
                        <span className="font-display text-gold text-lg font-bold">{founder.initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold text-sm group-hover:text-gold/90 transition-colors duration-400 truncate">{founder.name}</h3>
                          <span className="text-[8px] tracking-[0.15em] text-gold uppercase font-bold bg-gold/[0.07] px-2 py-0.5 rounded-full flex-shrink-0">{founder.role}</span>
                        </div>
                        <p className="text-gray-500 text-xs font-light leading-relaxed">{founder.bio}</p>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.35 }} className="border border-white/[0.05] rounded-2xl p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-[#0d0d0d] mt-2">
                    <div>
                      <p className="text-white text-sm font-semibold mb-0.5">Talk directly to us</p>
                      <p className="text-gray-600 text-xs font-light">No account managers. Ever.</p>
                    </div>
                    <a href="#contact" className="w-full sm:w-auto min-h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-gold/10 border border-gold/25 text-gold text-sm font-bold hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 px-5 py-2.5 flex-shrink-0 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] font-body">Apply now \u2192</a>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-divider mx-5 sm:mx-8 md:mx-12 max-w-7xl xl:mx-auto" />

        {/* CONTACT */}
        <section id="contact" className="scroll-mt-24 py-20 sm:py-28 md:py-36 bg-[#080808] [color-scheme:dark] relative">
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#080808_80%)]" />
          <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12">
              <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="lg:col-span-5">
                <Label text="Book a Session" />
                <h2 className="mb-5 font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight">Pick a time that works for you.</h2>
                <p className="mb-7 max-w-md font-light text-base leading-relaxed text-gray-500">Share your details and preferred slot. We'll confirm by email and follow up on WhatsApp.</p>
                <a href="mailto:brandteam@zivonx.com?subject=Book%20a%20session" className="text-gold hover:text-gold-light transition-colors text-sm mb-9 block">brandteam@zivonx.com</a>
                <ul className="space-y-4 border-l-2 border-gold/20 pl-6 text-sm font-light text-gray-600">
                  <li className="text-white/90"><span className="font-bold text-gold">30 min</span> strategy call</li>
                  <li>No obligation \u2014 we map fit and next steps.</li>
                  <li>Slots shown in your local time.</li>
                </ul>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="relative min-w-0 lg:col-span-7">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-gold/10 via-transparent to-gold/[0.05] opacity-60 blur-sm" />
                <div className="relative rounded-3xl border border-white/[0.07] bg-[#0d0d0d] p-6 sm:p-9 shadow-[0_8px_60px_rgba(0,0,0,0.4)]">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/6 blur-[60px] pointer-events-none" />
                  <form action="https://formsubmit.co/brandteam@zivonx.com" method="POST" className="space-y-5">
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_next" value="https://zivonx.com/#contact" />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Full name</label>
                        <input name="name" required placeholder="Your name" autoComplete="name" className="w-full rounded-xl border border-white/[0.07] bg-[#111111] px-4 py-3.5 text-sm font-light text-white placeholder:text-gray-700 transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-[#141414]" />
                      </div>
                      <div>
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Email</label>
                        <input name="email" type="email" required placeholder="you@company.com" autoComplete="email" className="w-full rounded-xl border border-white/[0.07] bg-[#111111] px-4 py-3.5 text-sm font-light text-white placeholder:text-gray-700 transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-[#141414]" />
                      </div>
                      <div>
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">WhatsApp</label>
                        <input name="whatsapp" type="tel" placeholder="+91 00000 00000" autoComplete="tel" className="w-full rounded-xl border border-white/[0.07] bg-[#111111] px-4 py-3.5 text-sm font-light text-white placeholder:text-gray-700 transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-[#141414]" />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Preferred date</label>
                        <input name="date" type="date" required className="w-full rounded-xl border border-white/[0.07] bg-[#111111] px-4 py-3.5 text-sm font-light text-white transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-[#141414]" />
                      </div>
                      <div>
                        <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">Preferred time</label>
                        <select name="time" required className="w-full rounded-xl border border-white/[0.07] bg-[#111111] px-4 py-3.5 text-sm font-light text-white transition-all duration-300 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 focus:bg-[#141414]">
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
                    <p className="text-center text-[10px] font-light italic text-gray-700">30 min strategy call \u00b7 No obligation \u00b7 Local time</p>
                    <button type="submit" className="w-full rounded-xl border border-gold-dark/30 bg-gold py-4 text-sm font-bold text-black shadow-sm transition-all duration-300 hover:bg-gold-light hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold active:scale-[0.99] tracking-wide">Submit application</button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WhatsApp FAB */}
        <a href="https://wa.me/919664412018" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[45] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-black shadow-[0_8px_32px_rgba(245,158,11,0.4)] ring-1 ring-gold/30 transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(245,158,11,0.5)] focus:outline-none sm:bottom-8 sm:right-8" aria-label="Message us on WhatsApp">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
        </a>

        <Footer />
      </div>
    </div>
  )
}
