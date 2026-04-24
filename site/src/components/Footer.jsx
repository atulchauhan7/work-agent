export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-dark-bg">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-3">
              Zivon<span className="text-gold">X</span>.
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A performance-driven growth partner for D2C brands. We scale revenue through ads, creatives, and strategy.
            </p>
            <p className="text-sm text-gray-600 mt-3">Bangalore, India</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navigation</h4>
            <div className="space-y-2">
              {['Home', 'Services', 'About', 'Work', 'Contact'].map(n => (
                <a key={n} href={`/#${n.toLowerCase()}`} className="block text-sm text-gray-500 hover:text-white transition-colors">
                  {n}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Ready to scale?</h4>
            <p className="text-sm text-gray-500 mb-4">
              We only take on 2–3 clients at a time. Limited spots available this quarter.
            </p>
            <p className="text-sm text-gray-600">
              Contact: <a href="mailto:brandteam@zivonx.com" className="text-gold hover:text-gold-light transition-colors">brandteam@zivonx.com</a>
            </p>
            <p className="text-xs text-gray-600 mt-1">Response time: Within 24 hours</p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com/zivonx" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold transition-colors text-sm">Instagram</a>
              <a href="https://linkedin.com/company/zivonx" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold transition-colors text-sm">LinkedIn</a>
              <a href="https://wa.me/919664412018" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gold transition-colors text-sm">WhatsApp</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2026 Zivonx. All rights reserved.</p>
          <p className="text-xs text-gray-700 italic">Scaling D2C brands — revenue over vanity.</p>
        </div>
      </div>
    </footer>
  )
}
