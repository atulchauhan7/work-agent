import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/* ─────────── Motion helpers ─────────── */
const FadeUp = ({ children, delay = 0, y = 22, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

const Reveal = ({ children, delay = 0, className = '' }) => (
  <span className="reveal-mask">
    <motion.span
      initial={{ y: '110%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.span>
  </span>
)

const Heading = ({ text, className = '', accent = [] }) => (
  <h2 className={className}>
    {text.split(' ').map((w, i) => (
      <span key={i} className="reveal-mask mr-[0.24em] last:mr-0">
        <motion.span
          initial={{ y: '108%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${accent.includes(w.replace(/[.,?]/g, '')) ? 'grad-text' : ''}`}
        >
          {w}
        </motion.span>
      </span>
    ))}
  </h2>
)

const Eyebrow = ({ children, dark = false }) => (
  <FadeUp className={`inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.04em] uppercase mb-5 ${dark ? 'text-white/50' : 'text-accent'}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
    {children}
  </FadeUp>
)

const Counter = ({ target, prefix = '', suffix = '', isStatic, staticVal, duration = 1600 }) => {
  const [c, setC] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const started = useRef(false)
  useEffect(() => {
    if (!inView || started.current || isStatic) return
    started.current = true
    const s = performance.now()
    const tick = n => { const p = Math.min((n - s) / duration, 1); setC((1 - Math.pow(1 - p, 3)) * target); if (p < 1) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }, [inView, target, duration, isStatic])
  return <span ref={ref} className="tabular-nums">{isStatic ? staticVal : `${prefix}${Math.floor(c)}${suffix}`}</span>
}

/* ─────────── Data ─────────── */
const BELIEFS = [
  { n: '01', t: 'Revenue is the only metric', d: 'Impressions, clicks and likes don’t pay the bills. Every decision we make is judged against profitable revenue.', c: '#2B50F6' },
  { n: '02', t: 'Focus beats scale', d: 'We partner with only 2–3 brands at a time. Deep, daily, founder-led attention — never spread thin across 30 accounts.', c: '#7C3AED' },
  { n: '03', t: 'Transparency by default', d: 'Every rupee is tracked and reported in plain numbers. No vanity dashboards, no hiding behind jargon.', c: '#10B981' },
]

const SYSTEM = [
  { t: 'Acquire', d: 'Full-funnel paid media on Meta & Google, engineered around ROAS, CAC and LTV.', icon: 'M3 17l6-6 4 4 8-8', c: '#2B50F6' },
  { t: 'Convert', d: 'Creative testing and CRO that turns traffic into profitable, repeatable orders.', icon: 'M12 2v20M2 12h20', c: '#7C3AED' },
  { t: 'Retain', d: 'Retention, AOV and lifecycle work that compounds revenue month over month.', icon: 'M21 12a9 9 0 11-6.2-8.5', c: '#10B981' },
]

const SERVICE_COLORS = ['#2B50F6', '#7C3AED', '#06B6D4', '#EC4899', '#F59E0B']

const SERVICES = [
  { n: '01', title: 'Performance Marketing', desc: 'Data-driven Meta & Google campaigns built to scale revenue profitably.', tags: ['ROAS scaling', 'Funnel TOF→BOF', 'Weekly reporting'] },
  { n: '02', title: 'Paid Social & Search', desc: 'Full-funnel ad execution with relentless creative testing and budget optimization.', tags: ['10–20 creatives/wk', 'Pixel & audiences', 'No drops at scale'] },
  { n: '03', title: 'Brand Strategy', desc: 'Positioning, messaging and identity that makes your brand impossible to ignore.', tags: ['Market research', 'Positioning & USP', 'Personas'] },
  { n: '04', title: 'Creative & Content', desc: 'High-converting creative built for performance — from UGC to scroll-stopping ad films.', tags: ['UGC & ad video', 'Hooks & scripts', 'Perf iteration'] },
  { n: '05', title: 'Website Optimisation', desc: 'We audit, redesign and optimise landing pages for speed, UX and conversion.', tags: ['CRO & A/B', 'Core Web Vitals', 'Landing redesign'], badge: 'New' },
]

const STATS = [
  { value: 3, suffix: 'Cr+', prefix: '₹', label: 'Revenue generated' },
  { value: 5, suffix: 'X', prefix: '3–', label: 'Blended ROAS', static: '3–5X' },
  { value: 40, suffix: '%+', prefix: '', label: 'CAC reduction' },
  { value: 100, suffix: '+', prefix: '', label: 'Daily orders' },
]

const CASES = [
  { brand: 'Dhirai', logo: '/dhirai.avif', tag: 'D2C Fashion', metric: '340%', metricLabel: 'Revenue growth', line: 'Rebuilt the funnel and creative engine — 340% growth in 6 months at 42% lower CAC.' },
  { brand: 'Gulaab Gali', logo: '/gulaab-gali.png', tag: 'Beauty & Personal Care', metric: '5.2x', metricLabel: 'Blended ROAS', line: 'Scaled paid social profitably while holding a consistent 5.2x blended return.' },
  { brand: 'Sakhiyaan', logo: '/sakhiyaan.webp', tag: 'Lifestyle', metric: '100+', metricLabel: 'Orders / day', line: 'Engineered a predictable acquisition system delivering 100+ orders daily.' },
]

const PILLARS = [
  { t: 'Strategy & Growth', d: 'Vision, positioning and the marketing engine behind every brand we scale.', icon: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z', c: '#2B50F6' },
  { t: 'Tech & Systems', d: 'High-converting websites, AI systems and landing pages built for performance.', icon: 'M9 3v18M3 9h18', c: '#7C3AED' },
  { t: 'Sales & Partnerships', d: 'A pipeline that turns conversations into partnerships, and partnerships into results.', icon: 'M3 12h18M3 6h18M3 18h18', c: '#10B981' },
]

const BRANDS = [
  { name: 'Gulaab Gali', logo: '/gulaab-gali.png' },
  { name: 'Dhirai', logo: '/dhirai.avif' },
  { name: 'Sakhiyaan', logo: '/sakhiyaan.webp' },
]

/* ─────────── Page ─────────── */
export default function HomePage() {
  const [openService, setOpenService] = useState(0)
  const logos = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS]

  return (
    <div className="min-h-screen bg-bg text-ink font-body antialiased">
      <Navbar />

      {/* ───── HERO ───── */}
      <section id="home" className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden">
        {/* soft gradient mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="blob blob-a absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-accent/30 blur-[130px]" />
          <div className="blob blob-b absolute -top-20 right-0 w-[560px] h-[560px] rounded-full bg-[#7C3AED]/25 blur-[140px]" />
          <div className="blob blob-c absolute top-40 left-1/3 w-[480px] h-[480px] rounded-full bg-[#06B6D4]/20 blur-[140px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3 py-1.5 mb-7 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-ring text-accent" />
              <span className="text-[12px] font-medium text-ink/70">Performance-driven growth partner · Bangalore</span>
            </motion.div>

            <h1 className="font-display font-semibold text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.98] tracking-[-0.035em] mb-7">
              <div><Reveal delay={0.1}>We build brands</Reveal></div>
              <div className="flex flex-wrap items-baseline gap-x-[0.25em]">
                <Reveal delay={0.22}>that</Reveal>
                <Reveal delay={0.3} className="grad-text">print revenue.</Reveal>
              </div>
            </h1>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-lg sm:text-xl text-muted leading-relaxed max-w-xl mb-9">
              A boutique D2C growth partner managing ₹50L+ in monthly ad spend across a handful of brands — turning paid media into a predictable, profitable revenue engine.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-col sm:flex-row gap-3">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#0C0C12] px-6 py-3.5 text-[15px] font-semibold hover:bg-accent hover:text-white transition-all">
                Book a call
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
              <a href="#work" className="inline-flex items-center justify-center rounded-lg border border-white/15 text-ink px-6 py-3.5 text-[15px] font-medium hover:bg-white/5 transition-colors">See our work</a>
            </motion.div>

            {/* social proof pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.85 }} className="flex flex-wrap gap-2.5 mt-7">
              {[
                { val: '₹3Cr+', label: 'Revenue driven' },
                { val: '5X', label: 'Blended ROAS' },
                { val: '100+', label: 'Orders / day' },
              ].map(p => (
                <span key={p.label} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5 text-[13px]">
                  <span className="font-semibold grad-text">{p.val}</span>
                  <span className="text-muted">{p.label}</span>
                </span>
              ))}
            </motion.div>
          </div>

          {/* product visual */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-14 sm:mt-20">
            <DashboardMock />
          </motion.div>
        </div>
      </section>

      {/* ───── LOGO STRIP ───── */}
      <section className="py-12 border-y border-line bg-dark overflow-hidden">
        <p className="text-center text-[12px] font-semibold tracking-[0.04em] uppercase text-muted mb-8">Trusted by fast-growing D2C brands</p>
        <div className="mask-fade-x">
          <div className="flex marquee-track items-center" style={{ animation: 'marquee 36s linear infinite' }}>
            {logos.map((c, i) => (
              <div key={i} className="shrink-0 px-10 sm:px-16">
                <img src={c.logo} alt={c.name} className="h-7 w-auto object-contain opacity-45 hover:opacity-90 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BELIEFS 01/02/03 ───── */}
      <section id="about" className="scroll-mt-24 border-y border-line bg-soft">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-28">
          <Eyebrow>What we believe</Eyebrow>
          <FadeUp delay={0.05}><h2 className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-14 max-w-2xl">Not another agency. A revenue partner.</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {BELIEFS.map((b, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group relative bg-soft-2 rounded-2xl border border-line p-8 sm:p-10 overflow-hidden hover:border-white/15 hover:shadow-soft transition-all duration-300">
                <span className="absolute top-0 left-0 h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${b.c}, transparent)` }} />
                <div className="absolute -bottom-6 -right-4 font-display text-[7rem] font-bold leading-none select-none pointer-events-none" style={{ color: b.c, opacity: 0.04 }}>{b.n}</div>
                <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: b.c + '40' }} />
                <span className="font-display text-sm font-semibold" style={{ color: b.c }}>{b.n}</span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold mt-6 mb-3 tracking-[-0.02em]">{b.t}</h3>
                <p className="text-muted leading-relaxed text-[15px]">{b.d}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SYSTEM + DIAGRAM ───── */}
      <section id="approach" className="scroll-mt-24 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-32">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Eyebrow>The approach</Eyebrow>
          <Heading text="Growth needs a system." accent={['system.']} className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-5 flex flex-wrap justify-center" />
          <FadeUp delay={0.1}><p className="text-muted leading-relaxed text-lg">One connected engine across the full funnel — so every rupee of spend compounds into predictable revenue.</p></FadeUp>
        </div>

        <FadeUp delay={0.1} className="mb-12"><SystemDiagram /></FadeUp>

        <div className="grid md:grid-cols-3 gap-4">
          {SYSTEM.map((s, i) => (
            <FadeUp key={i} delay={i * 0.1} className="group rounded-2xl border border-line p-7 hover:border-white/15 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 bg-soft" >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ background: s.c + '16' }}>
                  <svg className="w-5 h-5" style={{ color: s.c }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                </div>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: s.c, opacity: 0.5 }}>0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 tracking-[-0.02em]">{s.t}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{s.d}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ───── SERVICES ───── */}
      <section id="services" className="scroll-mt-24 border-y border-line bg-soft">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-28">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <Eyebrow>What we do</Eyebrow>
              <Heading text="Services" className="font-display font-semibold text-4xl sm:text-6xl tracking-[-0.03em] flex" />
            </div>
            <p className="text-muted max-w-xs text-[15px] md:text-right">Everything a D2C brand needs to scale profitably — under one roof.</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg overflow-hidden">
            {SERVICES.map((s, i) => (
              <ServiceRow key={i} s={s} i={i} open={openService} setOpen={setOpenService} color={SERVICE_COLORS[i % SERVICE_COLORS.length]} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-center">
          <div>
            <Eyebrow>By the numbers</Eyebrow>
            <Heading text="Proof, not promises." accent={['promises.']} className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-5 flex flex-wrap" />
            <FadeUp delay={0.1}><p className="text-muted leading-relaxed text-[15px] max-w-md">We measure ourselves the way our clients do — in revenue, return on ad spend and customer acquisition cost.</p></FadeUp>
          </div>
          <div className="grid grid-cols-2 gap-px bg-line border border-line rounded-2xl overflow-hidden">
            {STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08} className="bg-soft p-7 sm:p-9">
                <div className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.03em] mb-2 grad-text">
                  <Counter target={s.value} prefix={s.prefix} suffix={s.suffix} isStatic={!!s.static} staticVal={s.static} />
                </div>
                <p className="text-[13px] font-medium text-muted">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CASE STUDIES (dark) ───── */}
      <section id="work" className="scroll-mt-24 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-32">
          <Eyebrow dark>Proven in the real world</Eyebrow>
          <FadeUp delay={0.05}><h2 className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-14 max-w-2xl">Real brands. Real revenue.</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {CASES.map((c, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group relative rounded-2xl border border-white/10 bg-dark-2 p-7 overflow-hidden hover:border-white/25 transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -right-16 -top-16 w-44 h-44 rounded-full bg-accent/15 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${['#2B50F6','#7C3AED','#10B981'][i]}, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-8">
                    <img src={c.logo} alt={c.brand} className="h-6 w-auto object-contain opacity-80" style={{ filter: 'brightness(0) invert(1)' }} />
                    <span className="text-[11px] tracking-wide uppercase text-white/40">{c.tag}</span>
                  </div>
                  <div className="font-display text-5xl font-semibold tracking-[-0.03em] text-accent mb-1">{c.metric}</div>
                  <p className="text-[13px] text-white/50 mb-6">{c.metricLabel}</p>
                  <p className="text-white/70 text-[15px] leading-relaxed mb-7">{c.line}</p>
                  <a href="#contact" className="ul-grow inline-flex items-center gap-1.5 text-[14px] font-medium text-white">
                    Learn more
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </a>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BUILT FOR IMPACT (pillars, no names) ───── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <Eyebrow>How we operate</Eyebrow>
            <Heading text="Built for profit, not vanity." accent={['profit,']} className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-6 flex flex-wrap" />
            <FadeUp delay={0.1}>
              <p className="text-muted leading-relaxed text-[15px] mb-6 max-w-md">We started Zivonx because we were tired of agencies that vanish after onboarding. Every rupee is tracked, optimized and reported with complete transparency — we treat your budget like our own.</p>
              <p className="font-display text-xl font-medium">Based in Bangalore. Scaling brands across India.</p>
            </FadeUp>
          </div>
          <div className="space-y-3">
            {PILLARS.map((p, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group flex gap-5 rounded-2xl border border-line p-6 hover:border-white/15 hover:shadow-soft transition-all duration-300 bg-soft">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110" style={{ background: p.c + '16' }}>
                  <svg className="w-5 h-5" style={{ color: p.c }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={p.icon} /></svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1 tracking-[-0.02em]">{p.t}</h3>
                  <p className="text-muted text-[15px] leading-relaxed">{p.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="px-3 sm:px-5 py-6 sm:py-10">
        <div className="grad-surface relative max-w-7xl mx-auto rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="relative max-w-3xl mx-auto px-6 sm:px-12 py-20 sm:py-28 text-center text-white">
            <FadeUp><span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[12px] font-medium mb-7"><span className="w-1.5 h-1.5 rounded-full bg-white" /> 2 spots open this quarter</span></FadeUp>
            <Heading text="Ready to print revenue?" className="font-display font-semibold text-4xl sm:text-6xl tracking-[-0.035em] mb-6 flex flex-wrap justify-center" />
            <FadeUp delay={0.1}><p className="text-white/75 text-lg mb-9 max-w-xl mx-auto">We only take on 2–3 brands at a time — so every partnership gets founder-led attention from day one.</p></FadeUp>
            <FadeUp delay={0.15} className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#0C0C12] px-7 py-4 text-[15px] font-semibold hover:bg-white/90 transition-colors">
                Book a call
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
              <a href="#work" className="inline-flex items-center justify-center rounded-lg border border-white/30 text-white px-7 py-4 text-[15px] font-semibold hover:bg-white/10 transition-colors">See our work</a>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ───── CONTACT ───── */}
      <section id="contact" className="scroll-mt-24 border-t border-line">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-20 sm:py-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow>Get in touch</Eyebrow>
              <Heading text="Let's build your revenue engine." accent={['engine.']} className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-6 flex flex-wrap" />
              <FadeUp delay={0.1}>
                <p className="text-muted leading-relaxed mb-8 max-w-md">Share your details and a preferred slot. We'll confirm by email and follow up on WhatsApp within 24 hours.</p>
                <div className="space-y-4">
                  {[
                    { k: 'New business', v: 'brandteam@zivonx.com', href: 'mailto:brandteam@zivonx.com' },
                    { k: 'WhatsApp', v: '+91 73783 80250', href: 'https://wa.me/917378380250' },
                    { k: 'Location', v: 'Bangalore, India', href: null },
                  ].map(r => (
                    <div key={r.k} className="flex items-center justify-between border-b border-line pb-4">
                      <span className="text-[13px] font-medium text-muted">{r.k}</span>
                      {r.href ? <a href={r.href} className="ul-grow text-[15px] font-medium text-accent">{r.v}</a> : <span className="text-[15px] font-medium">{r.v}</span>}
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
            <FadeUp delay={0.1} className="lg:col-span-7">
              <div className="rounded-2xl border border-line bg-soft-2 p-6 sm:p-10">
                <form action="https://formsubmit.co/brandteam@zivonx.com" method="POST" className="space-y-5">
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_next" value="https://zivonx.com/#contact" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name"><input name="name" required placeholder="Your name" autoComplete="name" className={inputCls} /></Field>
                    <Field label="Email"><input name="email" type="email" required placeholder="you@company.com" autoComplete="email" className={inputCls} /></Field>
                    <Field label="WhatsApp"><input name="whatsapp" type="tel" placeholder="+91 00000 00000" autoComplete="tel" className={inputCls} /></Field>
                    <Field label="Monthly ad spend"><input name="spend" placeholder="e.g. ₹5L–₹20L" className={inputCls} /></Field>
                    <Field label="Preferred date"><input name="date" type="date" required className={inputCls} /></Field>
                    <Field label="Preferred time">
                      <select name="time" required className={inputCls}>
                        <option value="">Choose a time</option>
                        <option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option>
                        <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option>
                        <option>5:00 PM</option><option>6:00 PM</option><option>7:00 PM</option>
                      </select>
                    </Field>
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-accent text-white py-4 text-[15px] font-semibold hover:bg-accent-ink transition-colors">Request your strategy call</button>
                  <p className="text-center text-[12px] text-muted">30-min strategy call · No obligation · Local time</p>
                </form>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/917378380250" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-accent text-white shadow-card hover:bg-accent-ink transition-colors sm:bottom-8 sm:right-8 p-3.5" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      <Footer />
    </div>
  )
}

/* ─────────── Subcomponents ─────────── */
const inputCls = "w-full rounded-lg border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-[12px] font-semibold text-muted">{label}</span>
    {children}
  </label>
)

function ServiceRow({ s, i, open, setOpen, color }) {
  const isOpen = open === i
  return (
    <div className="border-b border-line last:border-0 relative" style={isOpen ? { background: color + '08' } : undefined}>
      {isOpen && <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: color }} />}
      <button onClick={() => setOpen(isOpen ? -1 : i)} onMouseEnter={() => setOpen(i)} className="w-full flex items-center gap-5 sm:gap-8 px-6 sm:px-9 py-6 sm:py-7 text-left">
        <span className="font-display text-[13px] font-semibold w-7 shrink-0" style={{ color }}>{s.n}</span>
        <span className="flex-1 font-display text-xl sm:text-3xl font-semibold tracking-[-0.02em] flex items-center gap-3 flex-wrap transition-colors" style={isOpen ? { color } : undefined}>
          {s.title}
          {s.badge && <span className="text-[10px] tracking-wide uppercase font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: color }}>{s.badge}</span>}
        </span>
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.3 }} className="text-2xl shrink-0" style={{ color: isOpen ? color : 'rgba(255,255,255,0.2)' }}>+</motion.span>
      </button>
      <motion.div initial={false} animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
        <div className="px-6 sm:px-9 pb-7 sm:pl-[4.7rem] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <p className="text-muted text-[15px] leading-relaxed max-w-lg">{s.desc}</p>
          <div className="flex flex-wrap gap-2">
            {s.tags.map(t => <span key={t} className="text-[12px] font-medium rounded-full px-3 py-1" style={{ color, background: color + '12' }}>{t}</span>)}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* Hero dashboard mock — clean product UI */
function DashboardMock() {
  const bars = [42, 55, 48, 67, 72, 63, 84, 78, 92, 88, 100, 95]
  return (
    <div className="rounded-2xl border border-line bg-bg shadow-card overflow-hidden max-w-5xl mx-auto">
      <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-accent pulse-ring text-accent" />
          <span className="text-[13px] font-semibold">Campaign Performance</span>
        </div>
        <span className="text-[12px] text-muted">Last 12 weeks</span>
      </div>
      <div className="grid sm:grid-cols-[1.4fr_1fr]">
        <div className="p-5 sm:p-7 border-b sm:border-b-0 sm:border-r border-line">
          <div className="flex items-end gap-3 mb-6">
            <div>
              <p className="text-[12px] text-muted mb-1">Blended ROAS</p>
              <p className="font-display text-4xl font-semibold tracking-[-0.03em]">5.2x</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-accent mb-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7v6h-6" /></svg>
              +18%
            </span>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {bars.map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: [0.16, 1, 0.3, 1] }} className={`flex-1 rounded-t ${i >= 10 ? 'bg-accent' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-7 grid grid-cols-2 sm:grid-cols-1 gap-5">
          {[
            { k: 'Revenue', v: '₹3.1Cr', s: 'this quarter' },
            { k: 'CAC', v: '−42%', s: 'in 60 days' },
            { k: 'Orders / day', v: '100+', s: 'consistent' },
          ].map(m => (
            <div key={m.k} className="flex flex-col">
              <span className="text-[12px] text-muted">{m.k}</span>
              <span className="font-display text-2xl font-semibold tracking-[-0.02em]">{m.v}</span>
              <span className="text-[11px] text-muted">{m.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* System diagram — central engine with connected nodes + animated flow */
function SystemDiagram() {
  const nodes = ['Audience', 'Creative', 'Funnel', 'Data']
  return (
    <div className="relative rounded-2xl border border-line bg-soft p-8 sm:p-14 overflow-hidden">
      <div className="grid sm:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-10">
        <div className="grid grid-cols-2 gap-3">
          {nodes.map((n, i) => (
            <motion.div key={n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-xl border border-line bg-soft-2 px-4 py-3 text-center text-[13px] font-medium">
              {n}
            </motion.div>
          ))}
        </div>
        <div className="hidden sm:flex items-center">
          <svg width="80" height="40" viewBox="0 0 80 40" className="text-accent/50"><line x1="0" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2" className="flow-line" /></svg>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl bg-dark-2 text-white px-6 py-8 text-center shadow-card ring-1 ring-white/10">
          <div className="w-10 h-10 rounded-xl bg-accent mx-auto mb-3 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
          </div>
          <p className="font-display text-lg font-semibold leading-tight">Zivonx<br />Growth Engine</p>
          <p className="text-white/50 text-[12px] mt-2">Acquire · Convert · Retain</p>
        </motion.div>
      </div>
    </div>
  )
}
