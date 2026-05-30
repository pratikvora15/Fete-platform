'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleJoin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName }),
      })

      if (res.ok) {
        setJoined(true)
      }
    } catch (error) {
      alert('Error joining waitlist')
    } finally {
      setLoading(false)
    }
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-ink mb-4">You're In! 🎉</h1>
          <p className="text-lg text-ink2 mb-6">
            You're #{Math.floor(Math.random() * 500) + 100} on our waitlist.
          </p>
          <p className="text-ink2 mb-8">
            Early access launching in 2 weeks. We'll email you when it's ready.
          </p>
          <p className="text-sm text-ink3">
            In the meantime, follow us on Instagram for updates!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-ink">Fête</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-warm to-cream py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-ink mb-4">
            Plan Your Perfect Celebration
          </h2>
          <p className="text-xl text-ink2 mb-8">
            Find venues, entertainers, caterers, and more. All in one place.
          </p>

          {/* Form */}
          <form onSubmit={handleJoin} className="bg-white rounded-xl shadow-xl p-8 mb-8">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-gold"
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:border-gold"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gold text-cream font-semibold rounded-lg hover:bg-gold-dk disabled:opacity-50 transition"
              >
                {loading ? 'Joining...' : 'Get Early Access'}
              </button>
            </div>
            <p className="text-xs text-ink3 mt-4">
              We'll never spam you. Unsubscribe anytime.
            </p>
          </form>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '✓', title: '50+ Suppliers', desc: 'Curated venues, caterers, photographers & more' },
              { icon: '✓', title: 'See Pricing', desc: 'No hidden costs. Upfront pricing from every supplier' },
              { icon: '✓', title: 'Book in Minutes', desc: 'Book your supplier directly through our platform' },
            ].map((prop, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl text-gold mb-2">{prop.icon}</div>
                <h3 className="font-semibold text-ink mb-1">{prop.title}</h3>
                <p className="text-sm text-ink2">{prop.desc}</p>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="bg-gold-lt border border-gold rounded-lg p-6 mb-8">
            <p className="text-sm text-ink2 mb-3">Join 450+ people getting early access</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gold text-cream flex items-center justify-center text-xs font-bold"
                >
                  {i}
                </div>
              ))}
              <div className="text-sm text-ink2 ml-2">+445 more</div>
            </div>
          </div>

          <p className="text-ink3 text-sm">
            Early access launches in 2 weeks
          </p>
        </div>
      </section>

      {/* Features Preview */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-ink text-center mb-12">How Fête Works</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Tell us about your event', desc: 'Share your date, location, and what you are celebrating' },
            { num: '2', title: 'Browse suppliers', desc: 'See pricing, availability, and reviews all in one place' },
            { num: '3', title: 'Book & celebrate', desc: 'Message suppliers, confirm booking, and start planning' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full bg-gold text-cream flex items-center justify-center font-bold text-lg mx-auto mb-4">
                {step.num}
              </div>
              <h4 className="font-semibold text-ink mb-2">{step.title}</h4>
              <p className="text-sm text-ink2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner CTA */}
      <div className="mt-8 text-center pb-12">
        <p className="text-sm text-ink2 mb-4">
          Are you a supplier? We're looking for partners!
        </p>
        <Link
          href="/partner/sign-up"
          className="inline-block px-6 py-2 border-2 border-gold text-gold rounded-lg hover:bg-gold-lt transition"
        >
          Join as a Partner
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-white px-6 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-ink2">
          <p>© 2024 Fête. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="hover:text-gold">Privacy</a>
            <a href="#" className="hover:text-gold">Terms</a>
            <a href="https://instagram.com" className="hover:text-gold">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  )
}