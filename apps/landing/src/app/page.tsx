'use client';

import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F4', color: '#2C2C2C' }}>

      {/* NAV */}
      <nav style={{ backgroundColor: '#FAF8F4' }} className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/icon.png" alt="Nookbud" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-lg" style={{ color: '#2C2C2C' }}>Nookbud</span>
          </div>
          {/* Nav CTA */}
          <a
            href="#download"
            className="px-5 py-2 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4A7C59' }}
          >
            Try Free
          </a>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <h1
          className="font-garamond text-6xl md:text-8xl leading-tight mb-6 max-w-3xl"
          style={{ color: '#2C2C2C' }}
        >
          Two homes.<br />One childhood.
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#6E6A66' }}>
          Nookbud helps co-parents stay organized, communicate clearly,
          and keep the focus on what matters.
        </p>
        <a
          href="#download"
          className="px-8 py-4 rounded-full text-white font-medium text-lg transition-opacity hover:opacity-90 mb-3"
          style={{ backgroundColor: '#4A7C59' }}
        >
          Try free for 14 days
        </a>
        <p className="text-sm" style={{ color: '#9A9490' }}>No credit card needed.</p>

        {/* Phone mockup placeholder */}
        <div
          className="mt-16 w-64 h-[500px] rounded-[40px] border-4 flex items-center justify-center shadow-2xl"
          style={{ borderColor: '#2C2C2C', backgroundColor: '#FAF8F4' }}
        >
          <div className="text-center p-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#4A7C59' }}>
              <img src="/icon.png" alt="" className="w-10 h-10 rounded-xl" />
            </div>
            <p className="text-sm font-medium" style={{ color: '#4A7C59' }}>App screenshot</p>
            <p className="text-xs mt-1" style={{ color: '#9A9490' }}>Coming soon</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT IT IS */}
      <section className="py-24 px-6" style={{ backgroundColor: '#4A7C59' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          {/* Screenshot placeholder */}
          <div
            className="w-56 h-[440px] rounded-[36px] border-4 flex items-center justify-center flex-shrink-0 shadow-xl"
            style={{ borderColor: 'rgba(250,248,244,0.3)', backgroundColor: 'rgba(250,248,244,0.1)' }}
          >
            <p className="text-sm text-center px-4" style={{ color: 'rgba(250,248,244,0.5)' }}>Timeline screenshot</p>
          </div>
          <div>
            <h2 className="font-garamond text-5xl md:text-6xl leading-tight mb-6" style={{ color: '#FAF8F4' }}>
              Built around your child,<br />not the conflict.
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(250,248,244,0.8)' }}>
              Schedules, messages, expenses, milestones — all in one place,
              shared between both parents.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE RECORD */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16">
          {/* Screenshot placeholder */}
          <div
            className="w-56 h-[440px] rounded-[36px] border-4 flex items-center justify-center flex-shrink-0 shadow-xl"
            style={{ borderColor: '#2C2C2C', backgroundColor: '#fff' }}
          >
            <p className="text-sm text-center px-4" style={{ color: '#9A9490' }}>Record view screenshot</p>
          </div>
          <div>
            <h2 className="font-garamond text-5xl md:text-6xl leading-tight mb-6" style={{ color: '#2C2C2C' }}>
              Everything recorded.<br />Nothing forgotten.
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: '#6E6A66' }}>
              Every update is timestamped and preserved. So when it matters,
              you already have the record.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES */}
      <section className="py-24 px-6" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-garamond text-4xl md:text-5xl text-center mb-16" style={{ color: '#2C2C2C' }}>
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '🌱', title: 'Shared schedule', desc: 'One calendar both parents trust.' },
              { emoji: '💬', title: 'Clear communication', desc: 'Messages that stay on record, without the noise.' },
              { emoji: '📋', title: 'Expense tracking', desc: 'Log shared costs simply. No more disputes.' },
              { emoji: '📁', title: 'Document storage', desc: 'Passports, medical records, school files — always accessible.' },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl" style={{ backgroundColor: '#FAF8F4' }}>
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#2C2C2C' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6E6A66' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: SOCIAL PROOF */}
      <section className="py-24 px-6" style={{ backgroundColor: '#FAF8F4' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="font-garamond text-4xl md:text-5xl text-center mb-16" style={{ color: '#2C2C2C' }}>
            From parents like you.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              '"Finally, something that makes co-parenting feel manageable."',
              '"We stopped arguing about pickups the week we started using it."',
              '"My kids see us coordinate smoothly. That alone is worth everything."',
            ].map((quote, i) => (
              <div key={i} className="p-8 rounded-2xl" style={{ backgroundColor: '#fff' }}>
                <p className="font-garamond text-xl leading-relaxed" style={{ color: '#2C2C2C' }}>{quote}</p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} style={{ color: '#D4845A' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: PRICING */}
      <section className="py-24 px-6" style={{ backgroundColor: '#fff' }}>
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-garamond text-4xl md:text-5xl mb-4" style={{ color: '#2C2C2C' }}>
            One plan.<br />No tiers. No tricks.
          </h2>
          <p className="mb-12" style={{ color: '#6E6A66' }}>Invite your co-parent at no extra cost.</p>

          <div className="rounded-3xl p-10 text-left shadow-lg border" style={{ borderColor: '#E8E4DF' }}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="font-semibold text-lg mb-1" style={{ color: '#2C2C2C' }}>Nookbud</p>
                <p className="font-garamond text-5xl" style={{ color: '#4A7C59' }}>₱349<span className="text-xl font-sans font-normal" style={{ color: '#6E6A66' }}>/mo</span></p>
                <p className="text-sm mt-1" style={{ color: '#9A9490' }}>or ₱2,499/year — save 2 months</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4A7C59' }}>
                <img src="/icon.png" alt="" className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            {[
              'All features included',
              'Unlimited co-parent invites',
              'Invited co-parents join free',
              '14-day free trial',
              'Cancel anytime',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 mb-3">
                <span style={{ color: '#4A7C59' }}>✓</span>
                <span className="text-sm" style={{ color: '#2C2C2C' }}>{item}</span>
              </div>
            ))}
            <a
              href="#download"
              className="mt-8 block w-full text-center py-4 rounded-full font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#4A7C59' }}
            >
              Try free for 14 days
            </a>
            <p className="text-center text-sm mt-3" style={{ color: '#9A9490' }}>No credit card needed.</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: OBJECTIONS */}
      <section className="py-24 px-6" style={{ backgroundColor: '#4A7C59' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-garamond text-4xl md:text-5xl text-center mb-16" style={{ color: '#FAF8F4' }}>
            Good questions.
          </h2>
          <div className="space-y-8">
            {[
              { q: 'Is my data private?', a: 'Yes. Your records are yours alone. We never share or sell your data.' },
              { q: 'Does the other parent have to use it?', a: 'No. You can use Nookbud solo to log and track everything on your own.' },
              { q: 'What happens after the trial?', a: '₱349/month, or ₱2,499/year. Cancel anytime — no questions asked.' },
            ].map(({ q, a }) => (
              <div key={q} className="border-t pt-8" style={{ borderColor: 'rgba(250,248,244,0.2)' }}>
                <p className="font-semibold text-lg mb-2" style={{ color: '#FAF8F4' }}>{q}</p>
                <p style={{ color: 'rgba(250,248,244,0.75)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section id="download" className="py-32 px-6 text-center" style={{ backgroundColor: '#FAF8F4' }}>
        <img src="/icon.png" alt="Nookbud" className="w-20 h-20 rounded-[22px] mx-auto mb-8 shadow-lg" />
        <h2 className="font-garamond text-5xl md:text-7xl mb-4" style={{ color: '#2C2C2C' }}>
          Try free for 14 days.
        </h2>
        <p className="text-lg mb-12" style={{ color: '#6E6A66' }}>For the child you both love.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="px-8 py-4 rounded-full font-medium text-white transition-opacity hover:opacity-90 text-lg"
            style={{ backgroundColor: '#2C2C2C' }}
          >
            📱 Download on App Store
          </a>
          <a
            href="#"
            className="px-8 py-4 rounded-full font-medium text-white transition-opacity hover:opacity-90 text-lg"
            style={{ backgroundColor: '#2C2C2C' }}
          >
            🤖 Get it on Google Play
          </a>
        </div>
        <p className="mt-6 text-sm" style={{ color: '#9A9490' }}>No credit card needed. Cancel anytime.</p>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t text-center" style={{ borderColor: '#E8E4DF', backgroundColor: '#FAF8F4' }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm" style={{ color: '#9A9490' }}>
          <span>© 2026 Nookbud</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="mailto:hello@nookbud.com" className="hover:underline">hello@nookbud.com</a>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden shadow-lg" style={{ backgroundColor: '#FAF8F4', borderTop: '1px solid #E8E4DF' }}>
          <a
            href="#download"
            className="block w-full text-center py-4 rounded-full font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#4A7C59' }}
          >
            Try free for 14 days →
          </a>
        </div>
      )}

    </div>
  );
}
