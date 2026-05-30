import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const CATEGORY_ICON: Record<string, string> = {
  entertainer: '🎩',
  venue: '🏛',
  food: '🍽',
  games: '🎲',
  other: '✨',
}

const CATEGORY_BG: Record<string, string> = {
  entertainer: 'bg-rose-lt',
  venue: 'bg-teal-lt',
  food: 'bg-blue-lt',
  games: 'bg-gold-lt',
  other: 'bg-warm',
}

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: supplier } = await db()
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!supplier) notFound()

  const category = Array.isArray(supplier.category) ? supplier.category[0] : (supplier.category ?? 'other')
  const icon = CATEGORY_ICON[category] ?? '✨'
  const bg = CATEGORY_BG[category] ?? 'bg-warm'

  return (
    <div className="min-h-screen bg-cream">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border bg-cream sticky top-0 z-50">
        <Link href="/" className="font-display text-2xl font-bold text-ink tracking-tight no-underline">
          Fête<span className="text-gold">.</span>
        </Link>
        <div className="flex gap-2.5 items-center">
          <Link href="/partner/sign-up">
            <button className="text-[13px] font-medium px-[18px] py-2 border border-border rounded-full bg-transparent text-ink hover:bg-warm transition-colors cursor-pointer font-sans">
              List your service
            </button>
          </Link>
          <Link href="/sign-in">
            <button className="text-[13px] font-semibold px-5 py-[9px] rounded-full bg-ink text-white border-none hover:opacity-85 transition-opacity cursor-pointer font-sans">
              Sign in
            </button>
          </Link>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-12 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-ink3 mb-6">
          <Link href="/" className="no-underline hover:text-ink">Home</Link>
          <span>/</span>
          <Link href={`/search?city=${encodeURIComponent(supplier.city ?? '')}`} className="no-underline hover:text-ink">
            {supplier.city}
          </Link>
          <span>/</span>
          <span className="text-ink">{supplier.name}</span>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-8 items-start">

          {/* ── Left: Profile ── */}
          <div>
            {/* Cover */}
            <div className={`w-full h-56 rounded-2xl flex items-center justify-center text-[72px] mb-6 ${bg}`}>
              {icon}
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-ink mb-1">{supplier.name}</h1>
                <div className="flex items-center gap-2 text-[13px] text-ink2">
                  <span className="capitalize">{category}</span>
                  <span>·</span>
                  <span>{supplier.city}, Canada</span>
                  {supplier.status === 'active' && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-teal font-medium">
                        <span className="w-[6px] h-[6px] rounded-full bg-teal" />
                        Available
                      </span>
                    </>
                  )}
                </div>
              </div>
              {(supplier.price_min || supplier.price_max) && (
                <div className="text-right">
                  <div className="text-xs text-ink3 mb-0.5">Starting from</div>
                  <div className="text-2xl font-semibold text-ink">${supplier.price_min ?? supplier.price_max}</div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border my-6" />

            {/* About */}
            <div className="mb-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-2">About</div>
              <p className="text-[15px] text-ink2 leading-[1.7]">
                {supplier.bio ?? `${supplier.name} is a ${category} based in ${supplier.city}. Contact them to learn more about their services and availability.`}
              </p>
            </div>

            {/* Tags */}
            {Array.isArray(supplier.category) && supplier.category.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {supplier.category.map((c: string) => (
                  <span key={c} className="text-xs px-3 py-1 rounded-full bg-warm text-ink2 capitalize">{c}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Inquiry card ── */}
          <div className="bg-white border border-border rounded-2xl p-6 sticky top-24">
            <div className="text-sm font-semibold text-ink mb-1">Send an inquiry</div>
            <div className="text-xs text-ink3 mb-5">Describe your event and {supplier.name.split(' ')[0]} will get back to you.</div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink2 mb-1 block">Event type</label>
                <select className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors">
                  <option>Baby shower</option>
                  <option>1st birthday</option>
                  <option>Welcome baby</option>
                  <option>Engagement party</option>
                  <option>Wedding</option>
                  <option>Corporate event</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink2 mb-1 block">Event date</label>
                <input type="date" className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink2 mb-1 block">Guest count</label>
                <input type="number" placeholder="e.g. 40" className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink2 mb-1 block">Message</label>
                <textarea
                  placeholder="Tell them about your event…"
                  rows={3}
                  className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full resize-none transition-colors"
                />
              </div>
            </div>

            <Link href="/sign-in">
              <button className="w-full py-3 rounded-full bg-ink text-white text-[13px] font-semibold border-none cursor-pointer font-sans hover:opacity-85 transition-opacity">
                Sign in to send inquiry
              </button>
            </Link>
            <div className="text-[10px] text-ink3 text-center mt-2">Free to inquire · No booking fees</div>
          </div>
        </div>
      </div>
    </div>
  )
}
