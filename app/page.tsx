'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

const DEMAND = [
  { label: 'Magicians', w: '82%', count: '147' },
  { label: 'Party venues', w: '71%', count: '128' },
  { label: 'Face painters', w: '54%', count: '97' },
  { label: 'Fire performers', w: '38%', count: '68' },
  { label: 'Stand-up comedians', w: '29%', count: '52' },
]

const VERTICALS = [
  {
    icon: '👶',
    name: 'Baby shower',
    desc: 'Venues, entertainers, games kits, and everything in between',
    count: '340+ suppliers in Toronto',
    badge: 'Most popular',
    iconBg: 'bg-rose-lt',
    badgeBg: 'bg-rose-lt',
    badgeText: 'text-rose',
  },
  {
    icon: '🏠',
    name: 'Welcome baby',
    desc: 'Intimate gatherings after baby arrives — keep it warm, keep it close',
    count: '210+ suppliers in Toronto',
    badge: null,
    iconBg: 'bg-teal-lt',
    badgeBg: '',
    badgeText: '',
  },
  {
    icon: '🎠',
    name: '1st birthday',
    desc: 'Characters, bouncy castles, entertainers, party game rentals',
    count: '480+ suppliers in Toronto',
    badge: null,
    iconBg: 'bg-blue-lt',
    badgeBg: '',
    badgeText: '',
  },
  {
    icon: '💍',
    name: 'Engagement party',
    desc: 'Jazz bands, string quartets, caricature artists, luxury venues',
    count: '290+ suppliers in Toronto',
    badge: 'New',
    iconBg: 'bg-gold-lt',
    badgeBg: 'bg-gold-lt',
    badgeText: 'text-amber',
  },
]

const ENTERTAINERS = [
  {
    emoji: '🪄',
    name: 'Marco the Magnificent',
    type: 'Magician · Toronto, ON',
    tags: ['Baby showers', 'Birthdays', 'Corporate'],
    rating: '4.9',
    reviews: '87',
    price: 'from $120/hr',
    photoBg: 'bg-rose-lt',
  },
  {
    emoji: '🔥',
    name: 'Soleil Fire Collective',
    type: 'Fire performers · Vancouver, BC',
    tags: ['Engagements', 'Outdoor events'],
    rating: '5.0',
    reviews: '44',
    price: 'from $400/show',
    photoBg: 'bg-warm',
  },
  {
    emoji: '🎭',
    name: 'Jess Mackay Comedy',
    type: 'Stand-up comedian · Toronto, ON',
    tags: ['Engagements', 'Corporate', 'Adults only'],
    rating: '4.8',
    reviews: '61',
    price: 'from $250/hr',
    photoBg: 'bg-teal-lt',
  },
]

const NAV_CATEGORIES = [
  { label: 'Baby showers',  category: 'Baby shower' },
  { label: 'Birthdays',     category: '1st birthday' },
  { label: 'Engagements',   category: 'Engagement party' },
  { label: 'Entertainers',  category: 'entertainer' },
  { label: 'Venues',        category: 'venue' },
]

export default function Home() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const [query, setQuery] = useState('')
  const [searchCity, setSearchCity] = useState('Toronto')

  function handleSearch() {
    const params = new URLSearchParams({ city: searchCity })
    if (query.trim()) params.set('q', query.trim())
    router.push(`/search?${params}`)
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border bg-cream sticky top-0 z-50">
        <div className="font-display text-2xl font-bold text-ink tracking-tight">
          Fête<span className="text-gold">.</span>
        </div>
        <ul className="flex gap-7 list-none m-0 p-0">
          {NAV_CATEGORIES.map(({ label, category }) => (
            <li key={label}>
              <Link href={`/search?category=${encodeURIComponent(category)}`} className="text-sm text-ink2 hover:text-ink transition-colors no-underline">{label}</Link>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 items-center">
          <Link href="/partner/sign-up">
            <button className="text-[13px] font-medium px-[18px] py-2 border border-border rounded-full bg-transparent text-ink hover:bg-warm transition-colors cursor-pointer font-sans">
              List your service
            </button>
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/search?city=Toronto">
                <button className="text-[13px] font-medium px-[18px] py-2 border border-border rounded-full bg-transparent text-ink hover:bg-warm transition-colors cursor-pointer font-sans">
                  Browse suppliers
                </button>
              </Link>
              <div className="w-9 h-9 rounded-full bg-ink flex items-center justify-center text-white text-[13px] font-semibold cursor-pointer select-none">
                {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? '?').toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link href="/partner/sign-in">
                <button className="text-[13px] font-medium px-[18px] py-2 border border-border rounded-full bg-transparent text-ink hover:bg-warm transition-colors cursor-pointer font-sans">
                  Partner sign-in
                </button>
              </Link>
              <Link href="/sign-in">
                <button className="text-[13px] font-medium px-[18px] py-2 border border-border rounded-full bg-transparent text-ink hover:bg-warm transition-colors cursor-pointer font-sans">
                  Sign in
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="text-[13px] font-semibold px-5 py-[9px] rounded-full bg-ink text-white border-none hover:opacity-85 transition-opacity cursor-pointer font-sans">
                  Sign up free
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] pb-14 grid grid-cols-2 gap-12 items-center">

          {/* Left: copy */}
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gold mb-4">
              Canada's event marketplace
            </div>
            <h1 className="font-display text-[54px] leading-[1.08] font-bold tracking-[-1px] text-ink mb-5">
              Every milestone<br />
              deserves a{' '}
              <em className="text-gold" style={{ fontStyle: 'italic' }}>perfect</em><br />
              celebration
            </h1>
            <p className="text-base text-ink2 mb-8 leading-[1.7] max-w-[480px]">
              Find venues, book entertainers, rent games, and plan every life event — baby showers,
              birthdays, and engagements — all in one place.
            </p>
            <div className="flex items-center bg-white border border-border rounded-xl p-[6px] pl-4 max-w-[480px] mb-5">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Magician, venue, fire performer in Toronto…"
                className="flex-1 border-none outline-none text-sm font-sans bg-transparent text-ink placeholder:text-ink3"
              />
              <button onClick={handleSearch} className="bg-ink text-white rounded-lg px-5 py-[10px] text-[13px] font-semibold font-sans border-none cursor-pointer">
                Search
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Baby shower',      category: 'Baby shower' },
                { label: '1st birthday',     category: '1st birthday' },
                { label: 'Engagement party', category: 'Engagement party' },
                { label: 'Fire performers',  category: 'Fire performer' },
                { label: 'Magicians',        category: 'Magician' },
                { label: 'Venue rental',     category: 'venue' },
              ].map(({ label, category }) => (
                <Link key={label} href={`/search?category=${encodeURIComponent(category)}`}>
                  <span className="text-xs py-1 px-3 rounded-full border border-border text-ink2 cursor-pointer hover:border-gold hover:text-gold transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right: card collage */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Tall card — spans 2 rows */}
            <div className="bg-white border border-border rounded-2xl p-4 row-span-2 relative">
              <div className="absolute top-3 right-3 text-[11px] font-semibold bg-ink text-white px-2 py-[3px] rounded-full">
                from $120
              </div>
              <div
                className="w-full rounded-[10px] mb-2.5 flex items-center justify-center text-4xl bg-rose-lt"
                style={{ aspectRatio: '1 / 1.2' }}
              >
                🪄
              </div>
              <div className="text-[13px] font-semibold text-ink mb-0.5">Marco the Magnificent</div>
              <div className="text-[11px] text-ink3">Magician · Toronto, ON</div>
              <span className="inline-block text-[10px] font-semibold py-[2px] px-2 rounded-full mt-1.5 bg-rose-lt text-rose">
                Baby showers
              </span>
              <div className="text-[11px] text-ink3 mt-1.5">⭐ 4.9 · 87 events</div>
            </div>
            {/* Card 2 */}
            <div className="bg-white border border-border rounded-2xl p-4">
              <div className="w-full aspect-square rounded-[10px] mb-2.5 flex items-center justify-center text-4xl bg-teal-lt">
                🌿
              </div>
              <div className="text-[13px] font-semibold text-ink mb-0.5">The Garden Loft</div>
              <div className="text-[11px] text-ink3">Venue · Queen West, Toronto</div>
              <span className="inline-block text-[10px] font-semibold py-[2px] px-2 rounded-full mt-1.5 bg-teal-lt text-teal">
                Up to 80 guests
              </span>
            </div>
            {/* Card 3 */}
            <div className="bg-white border border-border rounded-2xl p-4">
              <div
                className="w-full aspect-square rounded-[10px] mb-2.5 flex items-center justify-center text-4xl"
                style={{ background: '#EEEDFD' }}
              >
                🔥
              </div>
              <div className="text-[13px] font-semibold text-ink mb-0.5">Soleil Fire Collective</div>
              <div className="text-[11px] text-ink3">Fire performers · Vancouver</div>
              <span
                className="inline-block text-[10px] font-semibold py-[2px] px-2 rounded-full mt-1.5"
                style={{ background: '#EEEDFD', color: '#7B6FD4' }}
              >
                Engagements
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── VERTICALS ── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-[1200px] mx-auto px-12 py-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink3 mb-2">Plan by occasion</div>
          <h2 className="font-display text-[36px] font-bold tracking-[-0.5px] text-ink mb-8">Every event, covered</h2>
          <div className="grid grid-cols-4 gap-4">
            {VERTICALS.map(v => (
              <Link key={v.name} href={`/search?event=${encodeURIComponent(v.name)}`} className="no-underline">
              <div
                className="bg-white border border-border rounded-2xl p-6 flex flex-col gap-3 cursor-pointer hover:border-[rgba(24,22,15,0.16)] hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[22px] ${v.iconBg}`}>
                  {v.icon}
                </div>
                <div>
                  <div className="text-base font-semibold text-ink">{v.name}</div>
                  <div className="text-[13px] text-ink2 leading-[1.5] mt-1">{v.desc}</div>
                </div>
                <div className="text-[11px] text-ink3 mt-auto">{v.count}</div>
                {v.badge && (
                  <span className={`text-[10px] font-semibold py-[3px] px-2 rounded-full w-fit ${v.badgeBg} ${v.badgeText}`}>
                    {v.badge}
                  </span>
                )}
              </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-border mx-12" />

      {/* ── ENTERTAINERS ── */}
      <div className="max-w-[1200px] mx-auto px-12 py-14">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink3 mb-2">Featured entertainers</div>
        <h2 className="font-display text-[36px] font-bold tracking-[-0.5px] text-ink mb-8">
          Performers who make it unforgettable
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {ENTERTAINERS.map(e => (
            <Link key={e.name} href={`/search?q=${encodeURIComponent(e.name.split(' ')[0])}`} className="no-underline">
            <div
              className="bg-white border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-[rgba(24,22,15,0.16)] transition-colors"
            >
              <div className={`w-full h-40 flex items-center justify-center text-[52px] ${e.photoBg}`}>
                {e.emoji}
              </div>
              <div className="p-4">
                <div className="text-[15px] font-semibold text-ink mb-0.5">{e.name}</div>
                <div className="text-xs text-ink3 mb-2">{e.type}</div>
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {e.tags.map(t => (
                    <span key={t} className="text-[10px] py-[2px] px-2 rounded-full bg-warm text-ink2">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <div className="text-xs text-ink2">
                    ⭐ {e.rating} <span className="text-ink3">({e.reviews} reviews)</span>
                  </div>
                  <div className="text-[13px] font-semibold text-ink">{e.price}</div>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── SUPPLIER BANNER ── */}
      <section className="bg-ink py-14 px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gold mb-3">
              For entertainers &amp; venues
            </div>
            <div className="font-display text-[40px] font-bold leading-[1.15] text-white mb-4 tracking-[-0.5px]">
              Get discovered by event planners searching right now
            </div>
            <p className="text-[15px] leading-[1.7] mb-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Join 500+ suppliers already listed. Your first 6 months are completely free — no commission,
              no catch. Claim your profile in under 2 minutes.
            </p>
            <Link href="/partner/sign-up">
              <button className="text-sm font-semibold px-7 py-3 rounded-full bg-gold text-ink border-none cursor-pointer font-sans hover:opacity-90 transition-opacity">
                List your service — it&apos;s free
              </button>
            </Link>
          </div>

          {/* Demand widget */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="text-[13px] mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Live searches in Toronto this week
            </div>
            {DEMAND.map(d => (
              <div
                key={d.label}
                className="flex items-center py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-[13px] min-w-[140px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {d.label}
                </div>
                <div className="flex-1 mx-3 h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-sm bg-gold" style={{ width: d.w }} />
                </div>
                <div className="text-[13px] font-semibold text-white min-w-[40px] text-right font-mono">
                  {d.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-warm border-t border-border py-10 px-12 text-center">
        <div className="font-display text-[22px] font-bold text-ink mb-2">
          Fête<span className="text-gold">.</span>
        </div>
        <p className="text-xs text-ink3">Canada&apos;s event marketplace · Toronto · Vancouver · Ottawa · Calgary</p>
      </footer>

    </div>
  )
}
