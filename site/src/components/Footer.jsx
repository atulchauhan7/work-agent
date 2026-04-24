export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-dark-bg border-t border-white/[0.03] pt-14 sm:pt-24 pb-24 sm:pb-14 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold/3 blur-[140px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-8 mb-12 sm:mb-20 relative z-10">
          {/* Brand */}
          <div className="lg:col-span-5">
            <a href="#home" className="inline-block font-display text-3xl sm:text-4xl font-semibold tracking-wide mb-5">
              Zivonx<span className="text-gold">.</span>
            </a>
            <p className="text-gray-400 font-light text-sm max-w-xs mb-7 sm:mb-9 leading-relaxed">
              A performance-driven growth partner for D2C brands scaling through ads, creatives, and strategy.
            </p>
            <div className="space-y-2 mb-7 sm:mb-9">
              <p className="text-white text-sm tracking-[0.12em] font-medium">Bangalore, India</p>
              <a href="mailto:brandteam@zivonx.com" className="text-gold hover:text-gold-light transition-colors text-sm tracking-wide break-all">brandteam@zivonx.com</a>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', href: '#' },
                { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', href: '#' },
                { label: 'WhatsApp', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', href: 'https://wa.me/919664412018' },
              ].map(social => (
                <a key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 rounded-sm border border-white/[0.06] hover:border-gold/30 hover:text-gold hover:bg-gold/[0.04] text-gray-500 flex items-center justify-center transition-all duration-500 flex-shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={social.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3 lg:justify-self-center">
            <h4 className="text-white font-display text-base sm:text-lg mb-5 sm:mb-6 font-medium">Navigation</h4>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Services', href: '#services' },
                { label: 'About', href: '#about' },
                { label: 'Case Studies', href: '#work' },
                { label: 'Contact', href: '#contact' },
                { label: 'AI Chat', href: '/chat' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-gray-400 hover:text-gold transition-all duration-300 font-light text-sm hover:pl-1">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="lg:col-span-4 lg:justify-self-end flex flex-col items-start lg:items-end text-left lg:text-right">
            <h4 className="text-white font-display text-lg sm:text-xl mb-3 font-medium">Ready to scale?</h4>
            <p className="text-gray-400 font-light text-sm mb-6 sm:mb-7 leading-relaxed max-w-xs">
              We only take on 2–3 clients at a time. Limited spots available this quarter.
            </p>
            <a href="#contact" className="w-full sm:w-auto min-h-12 sm:min-h-0 inline-flex items-center justify-center gap-2 rounded-sm bg-gold text-black px-5 sm:px-6 py-3.5 sm:py-2.5 text-base sm:text-sm font-semibold hover:bg-gold-light active:scale-[0.99] transition-all duration-300 mb-7 sm:mb-9 border border-gold-dark/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              Apply to work with us
            </a>
            <div>
              <p className="text-white text-xs font-semibold tracking-[0.2em] uppercase mb-2.5 sm:mb-3">Response time</p>
              <p className="text-gray-500 text-sm font-light flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block pulse-ring text-green-400" />
                Within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="section-divider mb-6 sm:mb-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-4 relative z-10 text-center sm:text-left">
          <p className="text-gray-500 text-xs font-light order-2 sm:order-1">© {currentYear} Zivonx. All rights reserved.</p>
          <p className="text-gray-600 text-xs italic font-light tracking-wide order-1 sm:order-2">Scaling D2C brands — revenue over vanity.</p>
          <div className="flex gap-4 text-xs text-gray-500 font-light order-3">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <span className="text-white/10">·</span>
            <a href="#" className="hover:text-gold transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
