import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

const FREE_RESULTS = 2

const CATEGORY_ICON: Record<string, string> = {
  entertainer: '🎩', venue: '🏛', food: '🍽', games: '🎲',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { city, q, category, event } = await searchParams

  const cityStr = typeof city === 'string' ? city : 'Toronto'
  const qStr = typeof q === 'string' ? q : ''
  const categoryStr = typeof category === 'string' ? category : ''
  const eventStr = typeof event === 'string' ? event : ''

  const { userId } = await auth()
  const isSignedIn = !!userId

  let suppliers: Record<string, string>[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    let query = supabase.from('suppliers').select('*').eq('city', cityStr)
    if (qStr) query = query.ilike('name', `%${qStr}%`)
    if (categoryStr) query = query.contains('category', [categoryStr])
    const { data } = await query
    suppliers = (data ?? []) as Record<string, string>[]
  }

  const title = eventStr
    ? `${eventStr} suppliers in ${cityStr}`
    : categoryStr
      ? `${categoryStr} in ${cityStr}`
      : qStr
        ? `"${qStr}" in ${cityStr}`
        : `All suppliers in ${cityStr}`

  const visible = isSignedIn ? suppliers : suppliers.slice(0, FREE_RESULTS)
  const locked = isSignedIn ? [] : suppliers.slice(FREE_RESULTS)
  const lockedCount = locked.length

  return (
    <div className="min-h-screen bg-cream">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border bg-cream sticky top-0 z-50">
        <Link href="/" className="font-display text-2xl font-bold text-ink tracking-tight no-underline">
          Fête<span className="text-gold">.</span>
        </Link>
        <div className="flex items-center gap-4 text-sm text-ink2">
          {['Toronto', 'Vancouver', 'Calgary', 'Ottawa'].map(c => (
            <Link key={c} href={`/search?city=${c}`} className={`no-underline hover:text-ink ${cityStr === c ? 'text-ink font-semibold' : ''}`}>{c}</Link>
          ))}
        </div>
        <div className="flex gap-2 items-center">
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
        </div>
      </nav>

      {/* ── RESULTS ── */}
      <div className="max-w-[1200px] mx-auto px-12 py-10">
        <div className="mb-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-1">Search results</div>
          <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
          <p className="text-[13px] text-ink2 mt-1">{suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} found</p>
        </div>

        {suppliers.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl px-8 py-14 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <div className="text-sm font-semibold text-ink mb-1">No suppliers found</div>
            <div className="text-xs text-ink3 mb-5">Try a different city or search term.</div>
            <Link href="/">
              <button className="text-[13px] font-semibold px-6 py-2.5 rounded-full bg-ink text-white border-none cursor-pointer font-sans">
                Back to home
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-5">
              {/* Free results */}
              {visible.map(supplier => (
                <Link key={supplier.id} href={`/supplier/${supplier.id}`} className="no-underline">
                  <div className="bg-white border border-border rounded-2xl overflow-hidden hover:border-[rgba(24,22,15,0.16)] hover:-translate-y-0.5 transition-all cursor-pointer">
                    <div className="w-full h-36 bg-warm flex items-center justify-center text-[48px]">
                      {CATEGORY_ICON[supplier.category] ?? '✨'}
                    </div>
                    <div className="p-5">
                      <div className="text-[15px] font-semibold text-ink mb-0.5">{supplier.name}</div>
                      <div className="text-xs text-ink3 mb-3">{supplier.city}, Ontario</div>
                      {(supplier.price_min || supplier.price_max) && (
                        <div className="text-[13px] font-semibold text-gold">
                          from ${supplier.price_min ?? supplier.price_max}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Locked results — show blurred previews */}
              {locked.map(supplier => (
                <div key={supplier.id} className="relative rounded-2xl overflow-hidden">
                  {/* Blurred card */}
                  <div className="bg-white border border-border rounded-2xl overflow-hidden blur-sm select-none pointer-events-none">
                    <div className="w-full h-36 bg-warm flex items-center justify-center text-[48px]">
                      {CATEGORY_ICON[supplier.category] ?? '✨'}
                    </div>
                    <div className="p-5">
                      <div className="text-[15px] font-semibold text-ink mb-0.5">{supplier.name}</div>
                      <div className="text-xs text-ink3 mb-3">{supplier.city}, Ontario</div>
                    </div>
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl mb-1">🔒</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sign-in gate */}
            {lockedCount > 0 && (
              <div className="mt-8 bg-white border border-border rounded-2xl px-8 py-8 text-center">
                <div className="text-2xl mb-3">🔓</div>
                <div className="text-base font-semibold text-ink mb-1">
                  {lockedCount} more supplier{lockedCount !== 1 ? 's' : ''} available
                </div>
                <div className="text-[13px] text-ink2 mb-5">
                  Sign in to see all results, save favourites, and send inquiries — it&apos;s free.
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href={`/sign-in`}>
                    <button className="text-[13px] font-semibold px-6 py-2.5 rounded-full bg-ink text-white border-none cursor-pointer font-sans hover:opacity-85 transition-opacity">
                      Sign in to unlock
                    </button>
                  </Link>
                  <Link href={`/sign-up`}>
                    <button className="text-[13px] font-medium px-6 py-2.5 rounded-full border border-border text-ink bg-transparent cursor-pointer font-sans hover:bg-warm transition-colors">
                      Create free account
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
