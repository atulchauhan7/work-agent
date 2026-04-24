import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] } }),
}

const SERVICES = [
  { num: '01', title: 'Performance Marketing', desc: 'Data-driven campaigns optimizing ROAS, CAC & LTV across Meta and Google.', bullets: ['ROAS-focused scaling', 'Funnel optimization (TOF/MOF/BOF)', 'Weekly reporting & insights'] },
  { num: '02', title: 'Paid Social & Search', desc: 'Full-funnel ad execution with rapid creative testing and audience optimization.', bullets: ['Creative testing (10–20 variations/week)', 'Audience & pixel optimization', 'Budget scaling strategies'] },
  { num: '03', title: 'Brand Strategy', desc: 'Positioning, messaging, and identity that makes your brand unforgettable.', bullets: ['Competitor research & analysis', 'Brand USP development', 'Customer persona mapping'] },
  { num: '04', title: 'Creative & Content', desc: 'UGC and ad creatives engineered for scroll-stopping performance.', bullets: ['UGC & video production', 'Scroll-stopping hooks', 'Performance-based iteration'], badge: 'NEW' },
  { num: '05', title: 'Website Optimisation', desc: 'CRO, landing page redesign, and speed optimization for higher conversions.', bullets: ['CRO audits & A/B testing', 'Core Web Vitals optimization', 'Landing page redesign'] },
]

const WHY_US = [
  { icon: '◈', tag: 'FOCUS', title: 'We Go Deep, Not Wide', desc: 'Partner with only 2–3 brands at a time for deep, focused execution.', bullets: ['Daily campaign monitoring', 'Weekly strategy calls', 'Full-funnel optimization'] },
  { icon: '◇', tag: 'FOUNDER-LED', title: 'Work Directly With Founders', desc: 'No account managers, no juniors — direct access to decision-makers.', bullets: ['Direct WhatsApp/Slack access', 'Fast decision-making', 'Zero communication gaps'] },
  { icon: '△', tag: 'REVENUE FIRST', title: 'Profit Over Vanity', desc: 'We optimize for revenue, ROAS, and long-term profitability — not impressions.', bullets: ['ROAS & CAC focused', 'Data-backed scaling', 'No fluff reporting'] },
]

const STATS = [
  { value: '₹3Cr+', label: 'Revenue Generated' },
  { value: '3–5X', label: 'Blended ROAS' },
  { value: '42%', label: 'CAC Reduction' },
  { value: '100+', label: 'Daily Orders' },
]

const RESULTS = [
  { metric: 'Revenue Growth', value: '340%', detail: 'Month 1 → Month 6' },
  { metric: 'Blended ROAS', value: '5.2x', detail: 'Meta & Google' },
  { metric: 'CAC Reduction', value: '42%', detail: 'Within 60 days' },
  { metric: 'Orders/Day', value: '100+', detail: '4+ months consistent' },
]

const TEAM = [
  { initial: 'D', color: 'from-amber-500/20 to-orange-500/20', name: 'Dinesh Yelle', role: 'CEO', desc: 'Drives the vision, strategy, and marketing engine. The D2C growth brain behind every brand we scale.' },
  { initial: 'A', color: 'from-gold/20 to-yellow-500/20', name: 'Atul Chauhan', role: 'CTO', desc: 'Leads all tech — websites, AI systems, landing pages, and conversion-focused development that drives revenue.' },
  { initial: 'R', color: 'from-blue-500/20 to-cyan-500/20', name: 'Ritesh Y.', role: 'CSO', desc: 'Owns the sales pipeline and client acquisition. Turns conversations into partnerships and partnerships into results.' },
]

const BRANDS = [
  { name: 'Gulaab Gali', logo: '/gulaab-gali.png' },
  { name: 'Dhirai', logo: '/dhirai.avif' },
  { name: 'Sakhiyaan', logo: '/sakhiyaan.webp' },
]

function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 px-5 sm:px-6 ${className}`}>
      <div className="max-w-5xl mx-auto relative z-10">{children}</div>
    </section>
  )
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-gold/80 uppercase mb-4">
      <span className="w-8 h-[1px] bg-gold/40" />
      {children}
    </span>
  )
}

export default function HomePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="min-h-screen bg-dark-bg text-white noise overflow-x-hidden">
      <Navbar />

      {/* ─── HERO ─── */}
      <section ref={heroRef} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Ambient orbs */}
        <div className="hero-orb w-[600px] h-[600px] bg-gold/30 top-[-200px] left-[-200px]" />
        <div className="hero-orb w-[400px] h-[400px] bg-purple-500/20 bottom-[-100px] right-[-100px]" />
        <div className="hero-orb w-[300px] h-[300px] bg-blue-500/10 top-[30%] right-[20%]" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-5 sm:px-6 max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider border border-gold/30 text-gold rounded-full bg-gold/5 glow-gold">
              2 SPOTS OPEN FOR Q3
            </span>
            <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider border border-white/10 text-gray-500 rounded-full">
              META & GOOGLE CERTIFIED
            </span>
            <span className="px-3 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold tracking-wider border border-white/10 text-gray-500 rounded-full">
              BANGALORE
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-[clamp(1.8rem,7vw,5rem)] font-heading font-bold leading-[1.08] mb-5 sm:mb-6"
          >
            We Build Brands That<br />
            <span className="text-gradient">Print Revenue.</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-gray-400 text-sm sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            ₹50L+ in client revenue managed monthly. Two partnerships. Zero wasted spend. We don't do average.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <a href="#work" className="w-full sm:w-auto text-center px-8 py-3.5 bg-gradient-to-r from-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base">
              See our work
            </a>
            <a href="#contact" className="w-full sm:w-auto text-center px-8 py-3.5 border border-white/15 text-white rounded-xl hover:border-gold/30 hover:bg-white/[0.02] transition-all duration-300 text-sm sm:text-base">
              Check availability
            </a>
          </motion.div>

          {/* Brand marquee */}
          <div className="mt-12 sm:mt-20 overflow-hidden opacity-50">
            <div className="flex animate-marquee-fast whitespace-nowrap items-center">
              {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
                <div key={i} className="mx-6 sm:mx-14 shrink-0 flex items-center gap-2 sm:gap-3">
                  <img src={b.logo} alt={b.name} className="h-8 sm:h-10 w-auto object-contain brightness-0 invert opacity-60" loading="lazy" />
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-gray-400">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-widest text-gray-600 uppercase">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-gold/40 to-transparent" />
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <div className="divider-glow" />
      <Section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="text-center"
            >
              <div className="stat-value text-3xl sm:text-4xl md:text-5xl font-heading font-bold">{s.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2 tracking-wide">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>
      <div className="divider-glow" />

      {/* ─── SERVICES ─── */}
      <Section id="services">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>What We Do</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-2 mb-4">Our Services</h2>
          <p className="text-gray-500 max-w-lg mb-14">End-to-end growth solutions for D2C brands ready to scale profitably.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card-glow rounded-2xl p-6 sm:p-7 group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[11px] font-mono text-gray-600">{s.num}</span>
                {s.badge && <span className="px-2.5 py-0.5 text-[10px] font-bold bg-gold/10 text-gold rounded-full">{s.badge}</span>}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors duration-300">{s.title}</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{s.desc}</p>
              <ul className="space-y-2">
                {s.bullets.map(b => (
                  <li key={b} className="text-[13px] text-gray-400 flex items-start gap-2.5">
                    <span className="text-gold/60 mt-0.5 text-[10px]">✦</span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ─── WHY US ─── */}
      <Section id="about" className="relative">
        <div className="hero-orb w-[500px] h-[500px] bg-gold/10 top-[10%] right-[-200px]" />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>Why Us</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-2 mb-4">Not Another Agency.<br className="hidden sm:block" /> A Revenue Partner.</h2>
          <p className="text-gray-500 max-w-2xl mb-14 leading-relaxed">
            We work with a small number of D2C brands to scale revenue profitably through ads, creatives, and strategy.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {WHY_US.map((w, i) => (
            <motion.div
              key={w.tag}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card-glow rounded-2xl p-6 sm:p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center text-gold text-lg mb-4">
                {w.icon}
              </div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-gold/60 uppercase">{w.tag}</span>
              <h3 className="text-lg font-semibold text-white mt-2 mb-2">{w.title}</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{w.desc}</p>
              <ul className="space-y-2">
                {w.bullets.map(b => (
                  <li key={b} className="text-[13px] text-gray-400 flex items-start gap-2.5">
                    <span className="text-gold/60 mt-0.5 text-[10px]">✦</span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.p
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="text-center text-gray-500 mt-12 text-sm"
        >
          We've helped brands scale to <span className="text-white font-semibold">₹3Cr+ in revenue</span> with consistent 100+ daily orders.
        </motion.p>

        {/* Brands */}
        <div className="mt-14 text-center">
          <p className="text-[10px] font-bold tracking-[0.25em] text-gray-600 uppercase mb-8">Brands We've Worked With</p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16">
            {BRANDS.map(b => (
              <div key={b.name} className="flex flex-col items-center gap-2 group">
                <img src={b.logo} alt={b.name} className="h-10 sm:h-14 w-auto object-contain brightness-0 invert opacity-40 group-hover:opacity-70 transition-opacity duration-300" loading="lazy" />
                <span className="text-[10px] text-gray-600 uppercase tracking-wider">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <div className="divider-glow" />

      {/* ─── CASE STUDY ─── */}
      <Section id="work">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>Featured Case Study</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-2 mb-3">Scaling a Premium D2C Brand</h2>
          <p className="text-gray-500 mb-10">Dhirai · D2C Fashion & Lifestyle · Bangalore · 2024</p>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card-glow rounded-2xl p-7 sm:p-10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold to-transparent rounded-l-2xl" />
          <blockquote className="text-gray-300 italic text-lg sm:text-xl leading-relaxed mb-5 pl-6">
            "The ZivonX team didn't just manage our ads — they rebuilt our entire growth engine. CAC dropped 42% in the first 60 days..."
          </blockquote>
          <p className="text-sm text-gray-500 pl-6">— <span className="text-white font-medium">Deepak Meena</span>, Founder, Dhirai</p>
        </motion.div>

        <div className="mb-10">
          <h3 className="text-base font-semibold text-white mb-5 uppercase tracking-wider">What We Did</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              'Rebuilt ad account structure from scratch',
              'Introduced high-AOV bundles',
              'Scaled winning creatives through testing',
              'Optimized full funnel (TOF → Retargeting → Conversion)',
            ].map((item, i) => (
              <motion.div
                key={item}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-dark-card/50 border border-white/[0.03]"
              >
                <span className="text-gold text-xs mt-0.5">✦</span>
                <span className="text-[13px] text-gray-400">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RESULTS.map((r, i) => (
            <motion.div
              key={r.metric}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card-glow rounded-xl p-5 sm:p-6 text-center"
            >
              <div className="stat-value text-2xl sm:text-3xl font-heading font-bold">{r.value}</div>
              <div className="text-[13px] text-white mt-1.5">{r.metric}</div>
              <div className="text-[11px] text-gray-600 mt-1">{r.detail}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a href="#contact" className="inline-flex items-center gap-2 px-7 py-3 border border-gold/20 text-gold rounded-xl hover:bg-gold/5 transition-all duration-300 text-sm">
            Request Full Case Study
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </Section>

      {/* ─── TEAM ─── */}
      <Section className="relative">
        <div className="hero-orb w-[400px] h-[400px] bg-purple-500/10 bottom-0 left-[-150px]" />
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionLabel>The Origin</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-2 mb-4">We built the agency we wished we could hire.</h2>
          <p className="text-gray-500 max-w-2xl mb-3 leading-relaxed">
            We started Zivonx because we were tired of agencies that vanish after onboarding. Every brand deserves a team that cares about revenue as much as they do.
          </p>
          <p className="text-xs text-gray-600 mb-14 tracking-wide">Based in Bangalore. Scaling brands across India.</p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          {TEAM.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="card-glow rounded-2xl p-6 sm:p-7 text-center group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${t.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-xl font-heading font-bold text-gold">{t.initial}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              <p className="text-[13px] text-gold/70 mb-3">{t.role}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 italic">Talk directly to us — No account managers. Ever.</p>
        <div className="text-center mt-7">
          <a href="#contact" className="px-7 py-3.5 bg-gradient-to-r from-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.02] transition-all duration-300 inline-block">
            Apply now
          </a>
        </div>
      </Section>
      <div className="divider-glow" />

      {/* ─── CONTACT ─── */}
      <Section id="contact" className="max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
          <SectionLabel>Book A Session</SectionLabel>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-2 mb-4">Pick a time that works for you.</h2>
          <p className="text-gray-500">Share your details and preferred slot. We'll confirm within 24 hours.</p>
          <p className="text-sm text-gray-600 mt-2">
            <a href="mailto:brandteam@zivonx.com" className="text-gold/80 hover:text-gold transition-colors">brandteam@zivonx.com</a>
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          action="https://formsubmit.co/brandteam@zivonx.com"
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="https://zivonx.com/#contact" />
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="name" required placeholder="Full Name" className="w-full px-4 py-3.5 bg-dark-card border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus-gold transition-all" />
            <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3.5 bg-dark-card border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus-gold transition-all" />
          </div>
          <input name="whatsapp" placeholder="WhatsApp Number" className="w-full px-4 py-3.5 bg-dark-card border border-white/[0.06] rounded-xl text-white placeholder-gray-600 focus-gold transition-all" />
          <div className="grid sm:grid-cols-2 gap-4">
            <input name="date" type="date" required className="w-full px-4 py-3.5 bg-dark-card border border-white/[0.06] rounded-xl text-white focus-gold transition-all" />
            <select name="time" required className="w-full px-4 py-3.5 bg-dark-card border border-white/[0.06] rounded-xl text-white focus-gold transition-all">
              <option value="">Preferred Time</option>
              <option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option>
              <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-xl hover:shadow-gold/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer">
            Submit application
          </button>
          <p className="text-center text-[11px] text-gray-600 tracking-wide">30 min strategy call · No obligation · Slots shown in your local time</p>
        </motion.form>
      </Section>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919664412018"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-13 h-13 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 hover:scale-110 transition-all duration-300 z-50"
        aria-label="WhatsApp"
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.226-2.007l-.435-.325-2.648.887.887-2.648-.325-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
        </svg>
      </a>

      <Footer />
    </div>
  )
}
