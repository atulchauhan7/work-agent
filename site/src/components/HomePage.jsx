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
  { n: '01', t: 'We don’t get paid to impress you. We get paid to grow you.', d: 'Every rupee, every creative, every targeting decision is judged against one question: did revenue go up? Impressions and reach are vanity. Profitable orders are the only scorecard that matters.', c: '#2B50F6' },
  { n: '02', t: 'We run 3 brands. Never 30. That’s the entire point.', d: 'We deliberately cap at 3 active partnerships. No overworked account manager who Googled your product the morning of your call. You get a founder-level operator in your account, every single day.', c: '#7C3AED' },
  { n: '03', t: 'Open books. Every rupee. Every week. No exceptions.', d: 'You’ll get a weekly plain-English report: what we spent, where we spent it, what it returned, and what we’re changing next. No hiding behind jargon. No monthly PDF with 14 graphs and no answers.', c: '#10B981' },
]

const SYSTEM = [
  { t: 'Acquire', d: 'Precision Meta & Google campaigns engineered for one outcome: profitable new buyers. We don’t optimise for reach or clicks — we optimise for CAC, and we check it daily.', icon: 'M3 17l6-6 4 4 8-8', c: '#2B50F6' },
  { t: 'Convert', d: 'We ship 10–20 creatives a week and kill losers fast. Combined with landing page CRO and offer testing, we compound your conversion rate until your funnel actually pays for itself.', icon: 'M12 2v20M2 12h20', c: '#7C3AED' },
  { t: 'Retain', d: 'WhatsApp flows, email sequences and reactivation campaigns that turn one-time buyers into repeat customers — compounding LTV and protecting the margin your acquisition engine worked to build.', icon: 'M21 12a9 9 0 11-6.2-8.5', c: '#10B981' },
]

const SERVICE_COLORS = ['#2B50F6', '#7C3AED', '#06B6D4', '#EC4899', '#F59E0B']

const SERVICES = [
  { n: '01', title: 'Website Development & Tech', desc: 'We design and build fast, high-converting D2C websites and storefronts from scratch — performance-native, mobile-first and engineered to turn every click into revenue. Shopify, custom stacks and everything in between.', tags: ['D2C storefronts', 'Shopify & custom builds', 'Core Web Vitals'], badge: 'Top Service' },
  { n: '02', title: 'AI & Tech Systems', desc: 'We build AI-powered chat agents, automation workflows and performance infrastructure that give your brand an unfair technical edge. From AI customer support to full CRM integrations — we make the tech work for your revenue.', tags: ['AI chat & agents', 'Automation & CRM', 'Performance infra'], badge: 'Top Service' },
  { n: '03', title: 'Performance Marketing', desc: 'We take full ownership of your Meta & Google accounts — strategy, creative, targeting and budget. One obsessive goal: profitable revenue at scale. You’ll see ROAS move in weeks, not quarters.', tags: ['ROAS scaling', 'Full-funnel strategy', 'Weekly reporting'] },
  { n: '04', title: 'Paid Social & Creative', desc: '10–20 fresh creatives every week, tested against each other ruthlessly. The brands that win don’t outspend competitors — they out-test them. We build and run the creative machine that makes that happen.', tags: ['Creative velocity', 'Audience engineering', 'Hook engineering'] },
  { n: '05', title: 'Brand Strategy & Positioning', desc: 'Ads can’t fix a brand that’s not positioned to win. We nail your USP, sharpen your messaging and define the exact customer worth targeting before a single rupee hits the ad platform.', tags: ['Competitive research', 'Messaging & USP', 'Customer personas'] },
]

const STATS = [
  { value: 3, suffix: 'Cr+', prefix: '₹', label: 'Revenue generated across client brands' },
  { value: 5, suffix: 'X', prefix: '3–', label: 'Blended ROAS, held consistently at scale', static: '3–5X' },
  { value: 40, suffix: '%', prefix: '', label: 'Average drop in CAC within 60 days' },
  { value: 100, suffix: '+', prefix: '', label: 'Profitable orders delivered, daily' },
]

const CASES = [
  { brand: 'Dhirai', logo: '/dhirai.avif', tag: 'D2C Fashion', metric: '340%', metricLabel: 'Revenue growth in 6 months', line: 'Came to us stuck at 1.8× ROAS with a leaking funnel and dying creatives. We rebuilt the creative engine, fixed the offer architecture and scaled spend profitably — 340% revenue growth in 6 months at 42% lower CAC.' },
  { brand: 'Gulaab Gali', logo: '/gulaab-gali.png', tag: 'Beauty & Personal Care', metric: '5.2×', metricLabel: 'Blended ROAS, held at scale', line: 'Volatile ROAS, rising costs, creatives burning out in days. We systematised weekly creative testing, tightened their audience architecture — 5.2× blended return that holds even as monthly spend scales.' },
  { brand: 'Sakhiyaan', logo: '/sakhiyaan.webp', tag: 'Lifestyle', metric: '100+', metricLabel: 'Profitable orders, every day', line: 'Feast-or-famine results with zero predictability. We engineered a full acquisition system — right offer, right creative, right funnel — delivering 100+ orders daily, consistently, not just in lucky months.' },
]

const PILLARS = [
  { t: 'World-class websites & tech that convert before you spend a rupee', d: 'We design and build blazing-fast D2C storefronts, AI-powered chat agents and performance infrastructure. The right tech foundation means every marketing rupee goes further from day one.', icon: 'M9 3v18M3 9h18', c: '#2B50F6' },
  { t: 'Performance marketing engineered around your exact funnel', d: 'Before we write a single ad, we map your market, competitors and funnel gaps. That’s what makes paid media scale predictably — not luckily. Strategy first. Spend second.', icon: 'M13 2L3 14h7l-1 8 10-12h-7l1-8z', c: '#7C3AED' },
  { t: 'Partnerships where our income depends on your growth', d: 'We don’t do 3-month retainers to pad an invoice. We build long-term relationships where both sides win only if the revenue grows — which is exactly how it should work.', icon: 'M3 12h18M3 6h18M3 18h18', c: '#10B981' },
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
      <section id="home" className="relative pt-28 sm:pt-36 pb-10 sm:pb-14 overflow-hidden">
        {/* soft gradient mesh */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="blob blob-a absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-accent/30 blur-[130px]" />
          <div className="blob blob-b absolute -top-20 right-0 w-[560px] h-[560px] rounded-full bg-[#7C3AED]/25 blur-[140px]" />
          <div className="blob blob-c absolute top-40 left-1/3 w-[480px] h-[480px] rounded-full bg-[#06B6D4]/20 blur-[140px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-bg/60 to-bg" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

            {/* ── LEFT: copy ── */}
            <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur px-3 py-1.5 mb-7 shadow-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] pulse-ring text-[#10B981]" />
              <span className="text-[12px] font-medium text-ink/70">Accepting 1 new brand this quarter · Bangalore, India</span>
            </motion.div>

            <h1 className="font-display font-semibold text-[clamp(2.2rem,4.5vw,4.2rem)] leading-[0.98] tracking-[-0.035em] mb-7">
              <div><Reveal delay={0.1}>Your ads are spending.</Reveal></div>
              <div className="flex flex-wrap items-baseline gap-x-[0.25em]">
                <Reveal delay={0.22}>Your revenue should be</Reveal>
                <Reveal delay={0.3} className="grad-text">scaling.</Reveal>
              </div>
            </h1>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="text-lg text-muted leading-relaxed mb-9">
              We audit your full funnel, fix what’s bleeding budget, and build a paid media engine that delivers consistent 3–5× returns — run by a team that reports in plain numbers, not vanity decks. Most brands see a measurable breakthrough within 30 days.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="flex flex-col sm:flex-row gap-3">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#0C0C12] px-6 py-3.5 text-[15px] font-semibold hover:bg-accent hover:text-white transition-all">
                Get your free funnel audit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
              <a href="#work" className="inline-flex items-center justify-center rounded-lg border border-white/15 text-ink px-6 py-3.5 text-[15px] font-medium hover:bg-white/5 transition-colors">See client results</a>
            </motion.div>

            {/* social proof pills */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.85 }} className="flex flex-wrap gap-2.5 mt-7">
              {[
                { val: '₹3Cr+', label: 'Revenue generated for brands' },
                { val: '3–5×', label: 'ROAS we consistently maintain' },
                { val: '30 days', label: 'To first measurable result' },
              ].map(p => (
                <span key={p.label} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5 text-[13px]">
                  <span className="font-semibold grad-text">{p.val}</span>
                  <span className="text-muted">{p.label}</span>
                </span>
              ))}
            </motion.div>
            </div>

            {/* ── RIGHT: dashboard visual ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} className="w-full">
              <DashboardMock />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ───── LOGO STRIP ───── */}
      <section className="py-7 border-y border-line bg-dark overflow-hidden">
        <p className="text-center text-[11px] font-semibold tracking-[0.06em] uppercase text-muted/60 mb-5">Trusted by fast-growing D2C brands</p>
        <div className="mask-fade-x">
          <div className="flex marquee-track items-center" style={{ animation: 'marquee 14s linear infinite' }}>
            {logos.map((c, i) => (
              <div key={i} className="shrink-0 px-8 sm:px-12">
                <img src={c.logo} alt={c.name} className="h-6 w-auto object-contain opacity-45 hover:opacity-90 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PAIN SECTION ───── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-12 sm:py-16">
        <FadeUp className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.04em] uppercase text-red-400 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Sound familiar?
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-4">Recognize any of these?</h2>
          <p className="text-muted text-lg leading-relaxed">Every brand we’ve scaled started with at least one of these exact problems. This is what bad growth looks like — and why the old playbook keeps failing you.</p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '📉', problem: '"ROAS collapses the moment we scale"', detail: 'You double the budget and returns halve. Creatives die in 10 days. Your agency says “the algorithm is learning.” It isn’t learning — your offer, funnel and creative system are broken.' },
            { icon: '📊', problem: '"We spend ₹20L a month with no clarity"', detail: 'Beautiful dashboards. Impressive slide decks. But zero answer to one simple question: which rupee of spend actually caused a sale? You’re flying blind and paying premium for it.' },
            { icon: '🔄', problem: '"Revenue plateaus. Nothing moves the needle."', detail: 'You’ve tested new creatives, switched targeting, hired new freelancers. Same result every month. That’s not a budget problem — it’s a system problem. Tactics without a system don’t compound.' },
          ].map((p, i) => (
            <FadeUp key={i} delay={i * 0.1} className="shimmer-on-hover rounded-2xl border border-line bg-soft p-6 hover:border-white/15 transition-all duration-300">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-display text-lg font-semibold mb-3 tracking-[-0.02em]">{p.problem}</h3>
              <p className="text-muted text-[15px] leading-relaxed">{p.detail}</p>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.2} className="mt-7 text-center">
          <p className="text-muted text-[15px]">We’ve solved all three — for real brands with real budgets. <a href="#work" className="text-accent font-semibold hover:text-white transition-colors">See the case studies →</a></p>
        </FadeUp>
      </section>

      {/* ───── BELIEFS 01/02/03 ───── */}
      <section id="about" className="scroll-mt-24 border-y border-line bg-soft">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
          <Eyebrow>Why we’re different</Eyebrow>
          <FadeUp delay={0.05}><h2 className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-10 max-w-2xl">Built different. For a reason.</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            {BELIEFS.map((b, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group relative shimmer-on-hover bg-soft-2 rounded-2xl border border-line p-7 sm:p-8 overflow-hidden hover:border-white/15 hover:shadow-soft transition-all duration-300">
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
      <section id="approach" className="scroll-mt-24 max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Eyebrow>The approach</Eyebrow>
          <Heading text="Growth without a system is just luck." className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] leading-tight mb-5 text-center" />
          <FadeUp delay={0.1}><p className="text-muted leading-relaxed text-lg">One connected engine across the full funnel — so every rupee of ad spend compounds into predictable, repeatable revenue. No guessing. No lucky months.</p></FadeUp>
        </div>

        <FadeUp delay={0.1} className="mb-8"><SystemDiagram /></FadeUp>

        <div className="grid md:grid-cols-3 gap-4">
          {SYSTEM.map((s, i) => (
            <FadeUp key={i} delay={i * 0.1} className="group shimmer-on-hover rounded-2xl border border-line p-6 hover:border-white/15 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 bg-soft" >
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <Eyebrow>What we do</Eyebrow>
              <Heading text="Services" className="font-display font-semibold text-4xl sm:text-6xl tracking-[-0.03em] leading-tight" />
            </div>
            <p className="text-muted max-w-xs text-[15px] md:text-right">We lead with world-class website & tech builds, then make them perform with precision paid media.</p>
          </div>

          {/* ── Top 2 featured services — always visible ── */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {SERVICES.slice(0, 2).map((s, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group shimmer-on-hover relative rounded-2xl border border-[rgba(245,158,11,0.25)] bg-bg p-7 overflow-hidden hover:border-[rgba(245,158,11,0.45)] transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${SERVICE_COLORS[i]}, transparent)` }} />
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ background: SERVICE_COLORS[i] }} />
                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>★ Top Service</span>
                    <span className="text-[13px] font-semibold" style={{ color: SERVICE_COLORS[i] }}>{s.n}</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-[-0.02em] mb-3">{s.title}</h3>
                  <p className="text-muted text-[15px] leading-relaxed mb-5">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map(t => (
                      <span key={t} className="text-[12px] font-medium rounded-full px-3 py-1" style={{ color: SERVICE_COLORS[i], background: SERVICE_COLORS[i] + '14' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* ── Remaining services as accordion ── */}
          <div className="rounded-2xl border border-line bg-bg overflow-hidden">
            {SERVICES.slice(2).map((s, j) => (
              <ServiceRow key={j} s={s} i={j + 2} open={openService} setOpen={setOpenService} color={SERVICE_COLORS[(j + 2) % SERVICE_COLORS.length]} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-center">
          <div>
            <Eyebrow>By the numbers</Eyebrow>
            <Heading text="Numbers don't lie. Ours don't hide." className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] leading-tight mb-5" />
            <FadeUp delay={0.1}><p className="text-muted leading-relaxed text-[15px] max-w-md">We measure ourselves exactly the way our clients do — in revenue generated, return on ad spend and customer acquisition cost. These are real numbers from real brands.</p></FadeUp>
          </div>
          <div className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(43,80,246,0.3), rgba(124,58,237,0.3), rgba(6,182,212,0.3))' }}>
            {STATS.map((s, i) => (
              <FadeUp key={i} delay={i * 0.08} className="bg-soft p-6 sm:p-8">
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
          <FadeUp delay={0.05}><h2 className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] mb-10 max-w-2xl">These brands were exactly where you are now.</h2></FadeUp>
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
                  <a href="#contact" className="ul-grow inline-flex items-center gap-1.5 text-[14px] font-semibold text-white">
                    Get results like this
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </a>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PROCESS / HOW IT WORKS ───── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          <div>
            <Eyebrow>How we work</Eyebrow>
            <Heading text="From first call to case study. In 90 days." className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] leading-tight mb-6" />
            <FadeUp delay={0.1}>
              <p className="text-muted text-[15px] leading-relaxed mb-8 max-w-md">Other agencies spend the first 3 months on “strategy.” We spend it on results. By the time most agencies have finished their onboarding deck, we’ve already run 30+ creative tests and found what works for your brand.</p>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-6 py-3.5 text-[15px] font-semibold hover:bg-accent-ink transition-colors">
                Start with a free audit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
              <p className="text-muted text-[13px] mt-3">Free 30-min call · No obligation · You’ll leave with clarity either way</p>
            </FadeUp>
          </div>
          <div>
            {[
              { step: '01', t: 'Free funnel & ad account audit', d: 'We do a live teardown of your current campaigns, creatives and landing pages. You walk away with 3–5 specific, actionable fixes — whether you partner with us or not. No pitch. No pressure. Just substance.', badge: 'Day 1', c: '#2B50F6' },
              { step: '02', t: 'Custom 90-day growth roadmap', d: 'We build your brand-specific plan: which creatives to test first, which audiences to target, which funnel gaps to fix — sequenced by impact so you see results in week one, not month three.', badge: 'Days 2–5', c: '#7C3AED' },
              { step: '03', t: 'Go live, report weekly, compound daily', d: 'We’re in your account every day. You get a plain-English report every week: what ran, what worked, what we’re changing and what’s coming next. Numbers, not narratives.', badge: 'Days 7–90+', c: '#10B981' },
            ].map((s, i) => (
              <FadeUp key={i} delay={i * 0.1} className="flex gap-5 relative pb-8 last:pb-0">
                {i < 2 && <div className="absolute left-[18px] top-10 h-full w-px bg-gradient-to-b from-line to-transparent" />}
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 mt-0.5" style={{ background: s.c + '18', border: `1.5px solid ${s.c}45` }}>
                  <span className="font-display text-[11px] font-bold" style={{ color: s.c }}>{s.step}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">{s.t}</h3>
                    <span className="text-[11px] font-semibold rounded-full px-2.5 py-0.5" style={{ color: s.c, background: s.c + '14' }}>{s.badge}</span>
                  </div>
                  <p className="text-muted text-[15px] leading-relaxed">{s.d}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BUILT FOR IMPACT (pillars, no names) ───── */}
      <section className="border-y border-line bg-soft">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-12 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <Eyebrow>How we operate</Eyebrow>
            <Heading text="Why founders trust us with their growth." className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] leading-tight mb-6" />
            <FadeUp delay={0.1}>
              <p className="text-muted leading-relaxed text-[15px] mb-6 max-w-md">We built Zivonx because the agency model is fundamentally broken for founders who care about revenue. Most agencies are optimised for retainer security — not your growth. We’re built differently: performance-first, tech-forward, and completely transparent. Your results are our reputation.</p>
              <p className="font-display text-xl font-medium">Based in Bangalore. Scaling D2C brands across India.</p>
            </FadeUp>
          </div>
          <div className="space-y-3">
            {PILLARS.map((p, i) => (
              <FadeUp key={i} delay={i * 0.1} className="group shimmer-on-hover flex gap-5 rounded-2xl border border-line p-5 hover:border-white/15 hover:shadow-soft transition-all duration-300 bg-soft">
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
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="px-3 sm:px-5 py-12 sm:py-20">
        <div className="grad-surface relative max-w-7xl mx-auto rounded-3xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
          <div className="relative max-w-3xl mx-auto px-6 sm:px-12 py-16 sm:py-20 text-center text-white">
            <FadeUp><span className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur border border-white/15 px-3.5 py-1.5 text-[12px] font-medium mb-7"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] pulse-ring text-[#10B981]" /> Only 1 spot remaining this quarter</span></FadeUp>
            <Heading text="Your competitors are scaling. Are you?" className="font-display font-semibold text-4xl sm:text-6xl tracking-[-0.035em] leading-tight mb-6 text-center" />
            <FadeUp delay={0.1}><p className="text-white/75 text-lg mb-9 max-w-xl mx-auto">Every week you wait is another week of budget spent without a system behind it. One conversation could change your next 90 days. We’ll come prepared — you just show up.</p></FadeUp>
            <FadeUp delay={0.15} className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-[#0C0C12] px-7 py-4 text-[15px] font-semibold hover:bg-white/90 transition-colors">
                Book your free audit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </a>
              <a href="#work" className="inline-flex items-center justify-center rounded-lg border border-white/30 text-white px-7 py-4 text-[15px] font-semibold hover:bg-white/10 transition-colors">See client results</a>
            </FadeUp>
            <FadeUp delay={0.2}><p className="text-white/35 text-[13px] mt-6">Zero lock-in · Founder-led from day one · If numbers slip, you’ll hear it from us first</p></FadeUp>
          </div>
        </div>
      </section>

      {/* ───── CONTACT ───── */}
      <section id="contact" className="scroll-mt-24 border-t border-line bg-bg">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow>Book your free audit</Eyebrow>
              <Heading text="30 minutes. Real insights. Zero pitch." className="font-display font-semibold text-3xl sm:text-5xl tracking-[-0.03em] leading-tight mb-6" />
              <FadeUp delay={0.1}>
                <p className="text-muted leading-relaxed mb-8 max-w-md">We spend 20 minutes before every call reviewing your brand, your ads and your competitors. By the time we’re on the phone, we already know what’s holding you back — and we’ll tell you, straight.</p>
                <div className="space-y-4">
                  {[
                    { k: 'New business', v: 'brandteam@zivonx.com', href: 'mailto:brandteam@zivonx.com' },
                    { k: 'WhatsApp', v: '+91 73783 80250', href: 'https://wa.me/917378380250' },
                    { k: 'Location', v: 'Bangalore, India', href: null },
                  ].map(r => (
                    <div key={r.k} className="flex items-center justify-between border-b border-line pb-4 last:border-0">
                      <span className="text-[13px] font-medium text-muted">{r.k}</span>
                      {r.href ? <a href={r.href} className="ul-grow text-[15px] font-medium text-accent hover:text-white transition-colors">{r.v}</a> : <span className="text-[15px] font-medium">{r.v}</span>}
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
                  <button type="submit" className="w-full rounded-lg bg-accent text-white py-4 text-[15px] font-semibold hover:bg-accent-ink transition-colors flex items-center justify-center gap-2">
                    Book My Free Audit
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                  </button>
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-1">
                    {['Free. No strings.', 'We prep before you show up', 'Specific to your brand', 'Reply within 4 hours'].map(t => (
                      <span key={t} className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                        <svg className="w-3 h-3 text-[#10B981] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        {t}
                      </span>
                    ))}
                  </div>
                </form>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* WhatsApp FAB */}
      <a href="https://wa.me/917378380250" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-card hover:bg-accent-ink transition-colors sm:bottom-8 sm:right-8 p-3.5" aria-label="WhatsApp">
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
          {s.badge && (
            s.badge === 'Top Service'
              ? <span className="text-[10px] tracking-wide uppercase font-semibold px-2.5 py-0.5 rounded-full" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>{s.badge}</span>
              : <span className="text-[10px] tracking-wide uppercase font-semibold text-white px-2 py-0.5 rounded-full" style={{ background: color }}>{s.badge}</span>
          )}
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
  const barColors = (i) => {
    if (i >= 10) return '#2B50F6'
    if (i >= 7) return 'rgba(43,80,246,0.45)'
    return 'rgba(255,255,255,0.08)'
  }
  return (
    <div className="rounded-2xl border border-white/8 bg-soft shadow-card overflow-hidden w-full" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 80px rgba(0,0,0,0.6)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-white/6 bg-soft-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-ring text-accent" />
            <span className="text-[13px] font-semibold">Campaign Performance — Zivonx</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-[11px] text-muted">Last 12 weeks</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">Live</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-[1.5fr_1fr]">
        <div className="p-5 sm:p-7 border-b sm:border-b-0 sm:border-r border-white/6">
          <div className="flex items-end gap-4 mb-7">
            <div>
              <p className="text-[11px] uppercase tracking-[0.06em] text-muted mb-1.5">Blended ROAS</p>
              <p className="font-display text-5xl font-semibold tracking-[-0.04em] grad-text">5.2×</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/12 px-2.5 py-1 text-[12px] font-semibold text-[#10B981] mb-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M21 7v6h-6" /></svg>
              +18% vs prior
            </span>
          </div>
          <div className="flex items-end gap-1 h-28">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 rounded-t-sm"
                style={{ background: barColors(i) }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted">Week 1</span>
            <span className="text-[10px] text-muted">Week 12</span>
          </div>
        </div>
        <div className="p-5 sm:p-7 flex flex-col gap-4">
          {[
            { k: 'Revenue', v: '₹3.1Cr', s: 'this quarter', up: true },
            { k: 'CAC', v: '−42%', s: 'in 60 days', up: true },
            { k: 'Orders / day', v: '100+', s: 'consistent', up: true },
          ].map(m => (
            <div key={m.k} className="flex items-center justify-between rounded-xl bg-soft-2 px-4 py-3">
              <div>
                <span className="text-[11px] uppercase tracking-[0.05em] text-muted block mb-0.5">{m.k}</span>
                <span className="font-display text-2xl font-semibold tracking-[-0.02em]">{m.v}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted block">{m.s}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#10B981] mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7" /></svg>
                  Up
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* System diagram — central engine with connected nodes + animated flow */
function SystemDiagram() {
  const nodes = [
    { label: 'Audience', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    { label: 'Creative', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
    { label: 'Funnel', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
    { label: 'Data', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' },
  ]
  return (
    <div className="relative rounded-2xl border border-line bg-soft p-8 sm:p-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="relative grid sm:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-10">
        <div className="grid grid-cols-2 gap-3">
          {nodes.map((n, i) => (
            <motion.div key={n.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }} className="group rounded-xl border border-line bg-soft-2 px-4 py-3.5 text-center hover:border-accent/30 hover:bg-accent/5 transition-all duration-200">
              <svg className="w-4 h-4 mx-auto mb-1.5 text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d={n.icon} /></svg>
              <span className="text-[12px] font-medium">{n.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="hidden sm:flex flex-col items-center gap-2">
          <svg width="80" height="40" viewBox="0 0 80 40" className="text-accent/40"><line x1="0" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2" className="flow-line" /></svg>
          <span className="text-[10px] text-muted uppercase tracking-[0.06em]">Feeds into</span>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="rounded-2xl text-white text-center shadow-card relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2d8f 0%, #2B50F6 50%, #7C3AED 100%)' }}>
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
          <div className="relative px-6 py-8">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur mx-auto mb-3 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            </div>
            <p className="font-display text-lg font-semibold leading-tight">Zivonx<br />Growth Engine</p>
            <p className="text-white/55 text-[11px] mt-2 tracking-wide uppercase">Acquire · Convert · Retain</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
