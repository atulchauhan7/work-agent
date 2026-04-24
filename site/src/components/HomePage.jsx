import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }

const SERVICES = [
  { title: 'Performance Marketing', desc: 'Data-driven campaigns, ROAS/CAC/LTV optimization', bullets: ['ROAS-focused scaling', 'Funnel optimization (TOF/MOF/BOF)', 'Weekly reporting'] },
  { title: 'Paid Social & Search', desc: 'Full-funnel Meta & Google ads, A/B testing', bullets: ['Creative testing (10–20 variations/week)', 'Audience & pixel optimization', 'Budget scaling'] },
  { title: 'Brand Strategy', desc: 'Positioning, messaging, brand identity', bullets: ['Competitor research', 'Brand USP', 'Customer personas'] },
  { title: 'Creative & Content', desc: 'UGC, ad creatives for performance', bullets: ['UGC & video production', 'Scroll-stopping hooks', 'Performance-based iteration'], badge: 'NEW' },
  { title: 'Website Optimisation', desc: 'CRO, landing page redesign, speed', bullets: ['CRO audits & A/B testing', 'Core Web Vitals', 'Landing page redesign'] },
]

const WHY_US = [
  { tag: 'FOCUS & ATTENTION', title: 'We Go Deep, Not Wide', desc: 'Partner with only 2–3 brands', bullets: ['Daily monitoring', 'Weekly strategy calls', 'Full-funnel optimization'] },
  { tag: 'FOUNDER-LED EXECUTION', title: 'Work Directly With Founders', desc: 'No account managers, no juniors', bullets: ['Direct WhatsApp/Slack', 'Fast decisions', 'Zero communication gaps'] },
  { tag: 'REVENUE FIRST APPROACH', title: 'We Optimize for Profit, Not Vanity Metrics', desc: 'Revenue, ROAS, long-term profitability', bullets: ['ROAS & CAC focused', 'Data-backed scaling', 'No fluff reporting'] },
]

const STATS = [
  { value: '₹3Cr+', label: 'Revenue Generated' },
  { value: '3–5X', label: 'Blended ROAS Range' },
  { value: '42%', label: 'CAC Reduction' },
  { value: '100+', label: 'Daily Orders' },
]

const RESULTS = [
  { metric: 'Revenue Growth', value: '340%', detail: 'Month 1 → Month 6' },
  { metric: 'Blended ROAS', value: '5.2x', detail: 'Across Meta & Google' },
  { metric: 'CAC Reduction', value: '42%', detail: 'Within first 60 days' },
  { metric: 'Orders/Day', value: '100+', detail: 'Consistent 4+ months' },
]

const TEAM = [
  { initial: 'D', name: 'Dinesh Yelle', role: 'Strategy & Client', desc: 'Leads strategy and client relationships. D2C growth marketing brain.' },
  { initial: 'R', name: 'Ritesh Y.', role: 'Performance & Dev', desc: 'Performance marketing + development. All-rounder.' },
  { initial: 'A', name: 'Atul Chauhan', role: 'Technical Build', desc: 'Websites, landing pages, conversion-focused development.' },
]

const BRANDS = ['Gulaab Gali', 'Dhirai', 'Sakhiyaan']

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-3 py-1 text-xs font-semibold border border-gold/30 text-gold rounded-full bg-gold/5">2 SPOTS OPEN FOR Q3</span>
            <span className="px-3 py-1 text-xs font-semibold border border-white/10 text-gray-400 rounded-full">META & GOOGLE CERTIFIED</span>
            <span className="px-3 py-1 text-xs font-semibold border border-white/10 text-gray-400 rounded-full">BANGALORE-BASED</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6">
            We Build Brands That<br /><span className="text-gold">Print Revenue.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
            ₹50L+ in client revenue managed monthly. Two partnerships. Zero wasted spend. We don't do average.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#work" className="px-8 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold-light transition-colors">See our work</a>
            <a href="#contact" className="px-8 py-3 border border-white/20 text-white rounded-lg hover:border-gold/40 transition-colors">Check availability</a>
          </div>
        </motion.div>

        {/* Brand marquee */}
        <div className="mt-16 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="mx-8 text-gray-600 text-sm font-semibold uppercase tracking-widest">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-heading font-bold text-gold">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 px-6 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">What We Do</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-3 mb-12">Our Services</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-card border border-white/[0.06] rounded-2xl p-6 hover:border-gold/20 transition-colors group"
            >
              {s.badge && <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-gold/10 text-gold rounded-full mb-3">{s.badge}</span>}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors">{s.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.bullets.map(b => (
                  <li key={b} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-gold mt-0.5">✦</span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-8 italic">
          Faster sites convert more. A 1-second delay costs up to 7% in conversions.
        </p>
      </section>

      {/* Why Us */}
      <section id="about" className="py-20 px-6 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">Why Us</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-3 mb-4">Not Another Agency. A Revenue Partner.</h2>
          <p className="text-gray-500 max-w-2xl mb-12">
            We work with a small number of D2C brands to scale revenue profitably through ads, creatives, and strategy.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {WHY_US.map((w, i) => (
            <motion.div
              key={w.tag}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-dark-card border border-white/[0.06] rounded-2xl p-6"
            >
              <span className="text-[10px] font-bold tracking-widest text-gold/70 uppercase">{w.tag}</span>
              <h3 className="text-lg font-semibold text-white mt-2 mb-1">{w.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{w.desc}</p>
              <ul className="space-y-1.5">
                {w.bullets.map(b => (
                  <li key={b} className="text-sm text-gray-400 flex items-start gap-2">
                    <span className="text-gold mt-0.5">✦</span>{b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-gray-500 mt-10">
          We've already helped brands scale to <span className="text-white font-semibold">₹3Cr+ in revenue</span> with consistent 100+ daily orders — and we're just getting started.
        </p>

        {/* Brands */}
        <div className="mt-12 text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase mb-6">Brands We've Worked With</p>
          <div className="flex justify-center gap-10">
            {BRANDS.map(b => (
              <span key={b} className="text-gray-500 font-semibold text-sm">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section id="work" className="py-20 px-6 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">Featured Case Study</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-3 mb-4">Scaling a Premium D2C Brand to Profitable Growth</h2>
          <p className="text-gray-500 mb-8">Dhirai · D2C Fashion & Lifestyle · Bangalore · 2024</p>
        </motion.div>

        <div className="bg-dark-card border border-white/[0.06] rounded-2xl p-8 mb-10">
          <blockquote className="text-gray-300 italic text-lg leading-relaxed mb-4">
            "The ZivonX team didn't just manage our ads — they rebuilt our entire growth engine. CAC dropped 42% in the first 60 days..."
          </blockquote>
          <p className="text-sm text-gray-500">— <span className="text-white font-medium">Deepak Meena</span>, Founder, Dhirai</p>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-semibold text-white mb-4">What We Did</h3>
          <ul className="space-y-2">
            {[
              'Rebuilt ad account structure from scratch',
              'Introduced high-AOV bundles',
              'Scaled winning creatives through testing',
              'Optimized full funnel (TOF → Retargeting → Conversion)',
            ].map(item => (
              <li key={item} className="text-gray-400 flex items-start gap-2">
                <span className="text-gold mt-0.5">✦</span>{item}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RESULTS.map(r => (
            <div key={r.metric} className="bg-dark-card border border-white/[0.06] rounded-xl p-5 text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-gold">{r.value}</div>
              <div className="text-sm text-white mt-1">{r.metric}</div>
              <div className="text-xs text-gray-600 mt-0.5">{r.detail}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="#contact" className="px-6 py-3 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition-colors">
            Request Full Case Study
          </a>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">The Origin</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-3 mb-4">We built the agency we wished we could hire.</h2>
          <p className="text-gray-500 max-w-2xl mb-4">
            We started Zivonx because we were tired of agencies that vanish after onboarding. Every brand deserves a team that cares about revenue as much as they do.
          </p>
          <p className="text-sm text-gray-600 mb-12">Based in Bangalore. Scaling brands across India.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {TEAM.map(t => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-dark-card border border-white/[0.06] rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-heading font-bold text-gold">{t.initial}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              <p className="text-sm text-gold/70 mb-2">{t.role}</p>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 italic">Talk directly to us — No account managers. Ever.</p>
        <div className="text-center mt-6">
          <a href="#contact" className="px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold-light transition-colors">Apply now</a>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 max-w-3xl mx-auto">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest text-gold uppercase">Book A Session</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold mt-3 mb-4">Pick a time that works for you.</h2>
          <p className="text-gray-500">Share your details and preferred slot. We'll confirm within 24 hours.</p>
          <p className="text-sm text-gray-600 mt-2">brandteam@zivonx.com</p>
        </motion.div>

        <form
          action="https://formsubmit.co/brandteam@zivonx.com"
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" value="https://zivonx.com/#contact" />
          <div className="grid md:grid-cols-2 gap-4">
            <input name="name" required placeholder="Full Name" className="w-full px-4 py-3 bg-dark-card border border-white/[0.06] rounded-lg text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors" />
            <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-3 bg-dark-card border border-white/[0.06] rounded-lg text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors" />
          </div>
          <input name="whatsapp" placeholder="WhatsApp Number" className="w-full px-4 py-3 bg-dark-card border border-white/[0.06] rounded-lg text-white placeholder-gray-600 focus:border-gold/40 focus:outline-none transition-colors" />
          <div className="grid md:grid-cols-2 gap-4">
            <input name="date" type="date" required className="w-full px-4 py-3 bg-dark-card border border-white/[0.06] rounded-lg text-white focus:border-gold/40 focus:outline-none transition-colors" />
            <select name="time" required className="w-full px-4 py-3 bg-dark-card border border-white/[0.06] rounded-lg text-white focus:border-gold/40 focus:outline-none transition-colors">
              <option value="">Preferred Time</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
              <option>5:00 PM</option>
            </select>
          </div>
          <button type="submit" className="w-full py-3 bg-gold text-black font-semibold rounded-lg hover:bg-gold-light transition-colors cursor-pointer">
            Submit application
          </button>
          <p className="text-center text-xs text-gray-600">30 min strategy call · No obligation · Slots shown in your local time</p>
        </form>
      </section>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/919664412018"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-400 transition-colors z-50"
        aria-label="WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.325 0-4.47-.744-6.226-2.007l-.435-.325-2.648.887.887-2.648-.325-.435A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
      </a>

      <Footer />
    </div>
  )
}
