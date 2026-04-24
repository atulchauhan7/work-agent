export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-dark-bg overflow-hidden">
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 mb-12 sm:mb-14">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-white mb-4">
              Zivon<span className="text-gradient">X</span>.
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A performance-driven growth partner for D2C brands. We scale revenue through ads, creatives, and strategy.
            </p>
            <p className="text-sm text-gray-600 mt-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-gold/40 rounded-full" />
              Bangalore, India
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-semibold text-gold/60 mb-5 uppercase tracking-[0.2em]">Navigation</h4>
            <div className="space-y-3">
              {['Home', 'Services', 'About', 'Work', 'Contact'].map(n => (
                <a key={n} href={`/#${n.toLowerCase()}`} className="group flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                  <span className="w-0 group-hover:w-3 h-[1px] bg-gold/50 transition-all duration-300" />
                  {n}
                </a>
              ))}
              <a href="/chat" className="group flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors">
                <span className="w-0 group-hover:w-3 h-[1px] bg-gold/50 transition-all duration-300" />
                AI Chat
              </a>
            </div>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-[11px] font-semibold text-gold/60 mb-5 uppercase tracking-[0.2em]">Ready to scale?</h4>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              We only take on 2–3 clients at a time. Limited spots available this quarter.
            </p>
            <a
              href="mailto:brandteam@zivonx.com"
              className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors group"
            >
              brandteam@zivonx.com
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <p className="text-[11px] text-gray-700 mt-2 tracking-wide">Response time: Within 24 hours</p>
            <div className="flex gap-5 mt-5">
              {[
                { name: 'Instagram', url: 'https://instagram.com/zivonx' },
                { name: 'LinkedIn', url: 'https://linkedin.com/company/zivonx' },
                { name: 'WhatsApp', url: 'https://wa.me/919664412018' },
              ].map(s => (
                <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-gray-600 hover:text-gold transition-colors tracking-wide uppercase">
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="divider-glow" />
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-600 tracking-wide">© 2025 Zivonx. All rights reserved.</p>
          <p className="text-[11px] text-gray-700 italic tracking-wide">Scaling D2C brands — revenue over vanity.</p>
        </div>
      </div>
    </footer>
  )
}
