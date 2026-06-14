import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

const LAST_UPDATED = 'June 14, 2025'

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-10 scroll-mt-28">
    <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] mb-4 text-ink">{title}</h2>
    <div className="space-y-4 text-muted leading-relaxed text-[15px]">{children}</div>
  </section>
)

const TOC = [
  ['who-we-are',       'Who We Are'],
  ['data-we-collect',  'Information We Collect'],
  ['how-we-use',       'How We Use Your Data'],
  ['meta-ads',         'Meta (Facebook) Ads & Pixel'],
  ['third-parties',    'Third-Party Services'],
  ['cookies',          'Cookies & Tracking'],
  ['data-retention',   'Data Retention'],
  ['your-rights',      'Your Rights'],
  ['data-security',    'Data Security'],
  ['children',         'Children\'s Privacy'],
  ['changes',          'Changes to This Policy'],
  ['contact-us',       'Contact Us'],
]

export default function PrivacyPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-bg text-ink font-body antialiased">
      <Navbar />

      {/* ── Header ── */}
      <section className="pt-32 sm:pt-40 pb-10 border-b border-line">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-muted mb-6">
            Legal · Privacy Policy
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-[-0.035em] mb-4">Privacy Policy</h1>
          <p className="text-muted text-[15px]">Last updated: <span className="text-ink font-medium">{LAST_UPDATED}</span></p>
          <p className="text-muted text-[15px] mt-3 max-w-2xl leading-relaxed">
            ZivonX ("we", "us", "our") is committed to protecting your personal information. This policy explains what data we collect, why we collect it, and how you can exercise your rights — in plain English.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 md:px-12 py-14 sm:py-20">
        <div className="grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16 items-start">

          {/* ── Sticky TOC ── */}
          <aside className="hidden lg:block sticky top-28 self-start">
            <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-muted/60 mb-4">On this page</p>
            <nav className="space-y-1">
              {TOC.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-[13px] text-muted hover:text-ink transition-colors py-1 border-l-2 border-transparent hover:border-accent pl-3"
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <article>
            <Section id="who-we-are" title="1. Who We Are">
              <p>
                <strong className="text-ink">ZivonX</strong> is a performance marketing and digital growth agency based in Bangalore, India. We help D2C brands scale through paid media, website development, AI tools, and brand strategy.
              </p>
              <p>
                We operate the website <strong className="text-ink">zivonx.com</strong> and use it to communicate with prospective and current clients. Our primary contact email is{' '}
                <a href="mailto:brandteam@zivonx.com" className="text-accent hover:text-white transition-colors">brandteam@zivonx.com</a>.
              </p>
              <p>
                This policy applies to all visitors and users of our website. By using our site, you agree to the practices described here.
              </p>
            </Section>

            <Section id="data-we-collect" title="2. Information We Collect">
              <p>We collect two categories of data:</p>

              <div className="rounded-xl border border-line bg-soft p-5 space-y-4">
                <div>
                  <p className="font-semibold text-ink mb-1">A. Information you give us directly</p>
                  <p>When you fill out our audit booking form, you may provide:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>WhatsApp / phone number</li>
                    <li>Monthly advertising spend range</li>
                    <li>Preferred call date and time</li>
                  </ul>
                  <p className="mt-2 text-[14px]">We also collect your email if you contact us directly.</p>
                </div>
                <div className="border-t border-line pt-4">
                  <p className="font-semibold text-ink mb-1">B. Information collected automatically</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-[14px]">
                    <li>IP address and approximate location (country/city)</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time on page</li>
                    <li>Referral source (e.g. Google, Instagram)</li>
                    <li>Device type (mobile, desktop)</li>
                    <li>Cookie identifiers (see §6)</li>
                  </ul>
                </div>
              </div>

              <p>We do <strong className="text-ink">not</strong> collect payment details, government IDs, or sensitive personal categories of data.</p>
            </Section>

            <Section id="how-we-use" title="3. How We Use Your Data">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px]">
                <li>Respond to your audit booking and schedule a strategy call</li>
                <li>Send confirmation emails and reminders for your booked call</li>
                <li>Assess your brand's needs before we speak</li>
                <li>Send occasional marketing communications if you opt in (you can unsubscribe anytime)</li>
                <li>Improve our website and understand which content is valuable</li>
                <li>Run retargeting advertisements on Meta (Facebook/Instagram) and Google — see §4</li>
                <li>Comply with legal obligations under Indian law</li>
              </ul>
              <p>
                We process your data on the legal bases of <strong className="text-ink">legitimate interest</strong> (responding to your enquiry), <strong className="text-ink">consent</strong> (marketing), and <strong className="text-ink">contract performance</strong> (if we engage you as a client).
              </p>
            </Section>

            <Section id="meta-ads" title="4. Meta (Facebook) Ads & Pixel">
              <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-5">
                <p className="font-semibold text-ink mb-2">Important — Meta Advertising Disclosure</p>
                <p className="text-[14px]">
                  Our website may use the <strong className="text-ink">Meta Pixel</strong> (also called the Facebook Pixel), a piece of code provided by Meta Platforms, Inc. This tool allows us to measure the effectiveness of our advertising and show you relevant ads on Facebook and Instagram.
                </p>
              </div>

              <p>Specifically, the Meta Pixel may:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px]">
                <li>Record when you visit our website, which pages you view, and how long you stay</li>
                <li>Record "events" such as submitting the contact form</li>
                <li>Match your browser or device to a Facebook/Instagram account to enable retargeting</li>
                <li>Allow us to build "Custom Audiences" of site visitors and "Lookalike Audiences" to find new potential customers</li>
              </ul>

              <p>
                Meta may combine this data with information from its own platform and other websites that use the Meta Pixel, in accordance with{' '}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">Meta's Privacy Policy</a>.
              </p>

              <p>
                <strong className="text-ink">Your choices:</strong> You can opt out of interest-based advertising from Meta at any time by visiting{' '}
                <a href="https://www.facebook.com/ads/preferences" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">facebook.com/ads/preferences</a>
                {' '}or through the{' '}
                <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">Digital Advertising Alliance opt-out</a>.
                You may also use our cookie consent controls (see §6) to block the Pixel entirely.
              </p>

              <p>
                For more on how Meta uses data from sites that use their tools, see Meta's{' '}
                <a href="https://www.facebook.com/help/443157099197980" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">information about cookies and pixels</a>.
              </p>
            </Section>

            <Section id="third-parties" title="5. Third-Party Services">
              <p>We use a small number of trusted third-party services that may process your data on our behalf:</p>

              <div className="rounded-xl border border-line bg-soft overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-soft-2">
                      <th className="text-left px-4 py-3 font-semibold text-ink">Service</th>
                      <th className="text-left px-4 py-3 font-semibold text-ink">Purpose</th>
                      <th className="text-left px-4 py-3 font-semibold text-ink hidden sm:table-cell">Their Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {[
                      ['FormSubmit.co', 'Receives and forwards form submissions to our email', 'https://formsubmit.co/privacy'],
                      ['Vercel', 'Hosts this website; may log IP addresses', 'https://vercel.com/legal/privacy-policy'],
                      ['Meta Platforms', 'Advertising via Meta Pixel (see §4)', 'https://www.facebook.com/privacy/policy/'],
                      ['Google LLC', 'Advertising via Google Ads tag (if active)', 'https://policies.google.com/privacy'],
                    ].map(([name, purpose, link]) => (
                      <tr key={name}>
                        <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{name}</td>
                        <td className="px-4 py-3 text-muted">{purpose}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">View →</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>We do not sell, rent, or trade your personal information to any third party for their own marketing purposes.</p>
            </Section>

            <Section id="cookies" title="6. Cookies & Tracking">
              <p>Our website uses cookies — small text files stored in your browser. We use:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px]">
                <li><strong className="text-ink">Essential cookies:</strong> Required for the site to function (e.g. React Router state). Cannot be disabled.</li>
                <li><strong className="text-ink">Analytics cookies:</strong> Help us understand traffic and behaviour (e.g. Vercel Analytics).</li>
                <li><strong className="text-ink">Advertising cookies:</strong> Placed by the Meta Pixel and/or Google Ads tag to enable ad targeting and measurement.</li>
              </ul>
              <p>
                You can control non-essential cookies in your browser settings. Note that disabling advertising cookies will not stop ads from being shown — it means they will be less relevant to you.
              </p>
              <p>
                For more information on managing cookies, visit{' '}
                <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">allaboutcookies.org</a>.
              </p>
            </Section>

            <Section id="data-retention" title="7. Data Retention">
              <p>We retain your data only as long as necessary:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px]">
                <li><strong className="text-ink">Audit booking form data:</strong> Up to 24 months from the date of submission, or longer if we enter a client relationship with you</li>
                <li><strong className="text-ink">Email communications:</strong> Up to 3 years</li>
                <li><strong className="text-ink">Analytics data:</strong> Per the respective third party's retention policy (typically 12–26 months)</li>
                <li><strong className="text-ink">Client data:</strong> Duration of the engagement plus 5 years for accounting/legal compliance</li>
              </ul>
              <p>After these periods, data is securely deleted or anonymised.</p>
            </Section>

            <Section id="your-rights" title="8. Your Rights">
              <p>
                Under the <strong className="text-ink">Information Technology Act, 2000</strong> and the <strong className="text-ink">Digital Personal Data Protection Act, 2023 (DPDPA)</strong> (India), as well as applicable international standards, you have the right to:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['Access', 'Request a copy of the personal data we hold about you'],
                  ['Correction', 'Ask us to correct inaccurate or incomplete data'],
                  ['Erasure', 'Request deletion of your data ("right to be forgotten")'],
                  ['Portability', 'Receive your data in a structured, machine-readable format'],
                  ['Withdraw Consent', 'Withdraw marketing consent at any time without affecting prior processing'],
                  ['Grievance Redress', 'Lodge a complaint with the Data Protection Board of India once operational'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-xl border border-line bg-soft p-4">
                    <p className="font-semibold text-ink text-[14px] mb-1">{title}</p>
                    <p className="text-[13px]">{desc}</p>
                  </div>
                ))}
              </div>
              <p>
                To exercise any of these rights, email us at{' '}
                <a href="mailto:brandteam@zivonx.com" className="text-accent hover:text-white transition-colors">brandteam@zivonx.com</a>{' '}
                with the subject line <em>"Data Request"</em>. We will respond within 30 days.
              </p>
            </Section>

            <Section id="data-security" title="9. Data Security">
              <p>
                We take reasonable technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. These include:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[14px]">
                <li>HTTPS encryption on all pages</li>
                <li>Restricted access to personal data on a need-to-know basis</li>
                <li>Using reputable, security-certified third-party processors</li>
              </ul>
              <p>
                No method of internet transmission is 100% secure. If you believe your data has been compromised, please contact us immediately at{' '}
                <a href="mailto:brandteam@zivonx.com" className="text-accent hover:text-white transition-colors">brandteam@zivonx.com</a>.
              </p>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <p>
                Our website and services are directed at businesses and professionals. We do not knowingly collect personal data from anyone under the age of 18. If you believe a minor has submitted data through our site, please contact us and we will delete it promptly.
              </p>
            </Section>

            <Section id="changes" title="11. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make material changes, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically.
              </p>
              <p>
                Continued use of our website after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact-us" title="12. Contact Us">
              <p>For any privacy-related questions, requests, or complaints:</p>
              <div className="rounded-xl border border-line bg-soft p-5 space-y-3 text-[14px]">
                <div className="flex items-center gap-3">
                  <span className="text-muted w-20 shrink-0">Company</span>
                  <span className="text-ink font-medium">ZivonX</span>
                </div>
                <div className="flex items-center gap-3 border-t border-line pt-3">
                  <span className="text-muted w-20 shrink-0">Email</span>
                  <a href="mailto:brandteam@zivonx.com" className="text-accent hover:text-white transition-colors">brandteam@zivonx.com</a>
                </div>
                <div className="flex items-center gap-3 border-t border-line pt-3">
                  <span className="text-muted w-20 shrink-0">WhatsApp</span>
                  <a href="https://wa.me/917378380250" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">+91 73783 80250</a>
                </div>
                <div className="flex items-center gap-3 border-t border-line pt-3">
                  <span className="text-muted w-20 shrink-0">Location</span>
                  <span className="text-ink">Bangalore, India</span>
                </div>
              </div>
              <p className="text-[13px] mt-2">
                This policy should be read alongside Meta's{' '}
                <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">Data Policy</a>
                {' '}and{' '}
                <a href="https://www.facebook.com/business/help/721422165223546" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">Facebook Business Tools Terms</a>
                , which govern how Meta processes data collected via our advertising tools.
              </p>
            </Section>

            {/* Back home */}
            <div className="mt-12 pt-8 border-t border-line">
              <Link to="/" className="inline-flex items-center gap-2 text-[14px] font-medium text-muted hover:text-ink transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                Back to ZivonX
              </Link>
            </div>
          </article>
        </div>
      </div>

      <Footer />
    </div>
  )
}
