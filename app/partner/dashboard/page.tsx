import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import AvailabilityCalendar from './_components/AvailabilityCalendar'
import PartnerSidebar from '../_components/PartnerSidebar'

/* ── Supabase client (service role — server only) ─────────────────────────── */
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/* ── Types ────────────────────────────────────────────────────────────────── */
type Inquiry = {
  id: string
  planner_name: string
  planner_location: string | null
  event_type: string
  event_date: string | null
  guest_count: number | null
  budget_min: number | null
  budget_max: number | null
  status: string
  created_at: string
}

type Booking = {
  id: string
  event_type: string
  event_date: string
  amount_cents: number
  status: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-gold-lt text-amber',
  confirmed: 'bg-teal-lt text-teal',
  completed: 'bg-blue-lt text-blue',
  declined:  'bg-rose-lt text-rose',
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function monthStart(monthsAgo = 0) {
  const d = new Date()
  d.setMonth(d.getMonth() - monthsAgo, 1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function fmt(cents: number) {
  return '$' + (cents / 100).toLocaleString('en-CA', { maximumFractionDigits: 0 })
}


/* ── Page ─────────────────────────────────────────────────────────────────── */
export default async function PartnerDashboard() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = db()

  /* 1. Supplier profile */
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id, name, category, city, status')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!supplier) redirect('/partner/sign-up#partner-selector')

  const sid = supplier.id

  /* 2. Parallel data fetches */
  const [
    { count: viewsMTD },
    { count: viewsPrev },
    { count: inquiriesMTD },
    { count: inquiriesPrev },
    { count: bookingsMTD },
    { count: bookingsPrev },
    { data: earningsMTDRows },
    { data: earningsPrevRows },
    { data: recentInquiries },
    { data: allBookings },
    { data: blockedDates },
    { data: lifecycleBookings },
  ] = await Promise.all([
    supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('viewed_at', monthStart(0)),
    supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('viewed_at', monthStart(1)).lt('viewed_at', monthStart(0)),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('created_at', monthStart(0)),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('created_at', monthStart(1)).lt('created_at', monthStart(0)),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('created_at', monthStart(0)),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('supplier_id', sid).gte('created_at', monthStart(1)).lt('created_at', monthStart(0)),
    supabase.from('bookings').select('amount_cents').eq('supplier_id', sid).eq('status', 'completed').gte('created_at', monthStart(0)),
    supabase.from('bookings').select('amount_cents').eq('supplier_id', sid).eq('status', 'completed').gte('created_at', monthStart(1)).lt('created_at', monthStart(0)),
    supabase.from('inquiries').select('*').eq('supplier_id', sid).order('created_at', { ascending: false }).limit(10),
    supabase.from('bookings').select('event_type, created_at, amount_cents, status').eq('supplier_id', sid).order('created_at', { ascending: false }),
    supabase.from('availability_blocks').select('blocked_date').eq('supplier_id', sid),
    /* Lifecycle: baby shower bookings placed 9–13 months ago */
    supabase.from('bookings').select('id').eq('supplier_id', sid).eq('event_type', 'Baby shower').gte('created_at', monthStart(13)).lt('created_at', monthStart(9)),
  ])

  /* 3. Derived metrics */
  function pctChange(curr: number, prev: number) {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  const earningsMTD = (earningsMTDRows ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0)
  const earningsPrev = (earningsPrevRows ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0)

  const metrics = [
    { label: 'Profile views',  value: (viewsMTD ?? 0).toLocaleString(), change: pctChange(viewsMTD ?? 0, viewsPrev ?? 0), icon: '👁',  iconBg: 'bg-blue-lt' },
    { label: 'Inquiries',      value: String(inquiriesMTD ?? 0),        change: pctChange(inquiriesMTD ?? 0, inquiriesPrev ?? 0), icon: '✉', iconBg: 'bg-gold-lt' },
    { label: 'Bookings',       value: String(bookingsMTD ?? 0),         change: pctChange(bookingsMTD ?? 0, bookingsPrev ?? 0), icon: '✓',  iconBg: 'bg-teal-lt' },
    { label: 'Earnings (MTD)', value: fmt(earningsMTD),                 change: pctChange(earningsMTD, earningsPrev), icon: '💰', iconBg: 'bg-rose-lt' },
  ]

  /* 4. Bar chart — bookings per month (last 6) */
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    return { label: d.toLocaleString('en', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
  })

  const bookingsByMonth: Record<string, number> = {}
  for (const b of allBookings ?? []) {
    const key = b.created_at.slice(0, 7)
    bookingsByMonth[key] = (bookingsByMonth[key] ?? 0) + 1
  }
  const maxBar = Math.max(1, ...monthLabels.map(m => bookingsByMonth[m.key] ?? 0))
  const barData = monthLabels.map((m, i) => ({
    ...m,
    count: bookingsByMonth[m.key] ?? 0,
    pct: Math.round(((bookingsByMonth[m.key] ?? 0) / maxBar) * 100),
    highlight: i === 5,
  }))

  /* 5. Donut — bookings by event type */
  const eventCounts: Record<string, number> = {}
  for (const b of allBookings ?? []) {
    eventCounts[b.event_type] = (eventCounts[b.event_type] ?? 0) + 1
  }
  const totalEvents = Object.values(eventCounts).reduce((s, n) => s + n, 0) || 1
  const DONUT_COLORS: Record<string, string> = {
    'Baby shower': '#C4506A', '1st birthday': '#C4913A',
    'Engagement party': '#2F6EC4', 'Welcome baby': '#2E9B72',
    'Corporate': '#7B6FD4',
  }
  const donutSegments = Object.entries(eventCounts).map(([type, count]) => ({
    type, count, pct: Math.round((count / totalEvents) * 100),
    color: DONUT_COLORS[type] ?? '#A09C93',
  }))

  /* Build conic-gradient string */
  let angle = 0
  const conicParts = donutSegments.map(s => {
    const from = angle
    angle += (s.count / totalEvents) * 100
    return `${s.color} ${from.toFixed(1)}% ${angle.toFixed(1)}%`
  })
  const donutGradient = conicParts.length
    ? `conic-gradient(${conicParts.join(', ')})`
    : 'conic-gradient(#E5E0D8 0% 100%)'

  /* 6. Lifecycle alert */
  const lifecycleCount = lifecycleBookings?.length ?? 0
  const showLifecycleAlert = lifecycleCount > 0

  /* 7. Pending inquiry badge count */
  const pendingCount = (recentInquiries as Inquiry[] ?? []).filter(i => i.status === 'pending').length

  /* ── Render ── */
  return (
    <div className="flex min-h-screen">

      <PartnerSidebar supplier={supplier} pendingCount={pendingCount} />

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-x-auto bg-cream">

        {/* Topbar */}
        <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-border">
          <div className="text-lg font-semibold text-ink">Good morning, {supplier.name.split(' ')[0]} 👋</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: supplier.status === 'active' ? '#2E9B72' : '#A09C93' }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: supplier.status === 'active' ? '#2E9B72' : '#A09C93' }} />
              {supplier.status === 'active' ? 'Listing live' : 'Listing paused'}
            </div>
            <Link href="/partner/profile">
              <button className="text-xs font-semibold px-4 py-[7px] rounded-full bg-ink text-white border-none cursor-pointer font-sans">
                Edit profile
              </button>
            </Link>
          </div>
        </div>

        <div className="p-8 flex-1">

          {/* ── Lifecycle alert (only shown when there are past baby shower bookings 9–13 months ago) ── */}
          {showLifecycleAlert && (
            <div className="flex items-center gap-4 mb-7 px-5 py-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,#FCEEF2,white)', border: '1.5px solid #C4506A' }}>
              <span className="text-3xl flex-shrink-0">🚨</span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-rose mb-0.5">
                  {lifecycleCount} upcoming 1st birthday{lifecycleCount > 1 ? 's' : ''} from your past baby shower clients
                </div>
                <div className="text-xs text-ink2">
                  Families you performed at baby showers for are approaching their child's 1st birthday. Update your availability to capture this demand.
                </div>
              </div>
              <Link href="/partner/calendar">
                <button className="text-xs font-semibold px-4 py-[7px] rounded-full bg-rose text-white border-none cursor-pointer font-sans flex-shrink-0">
                  Update availability
                </button>
              </Link>
            </div>
          )}

          {/* ── Metric cards ── */}
          <div className="grid grid-cols-4 gap-3.5 mb-7">
            {metrics.map(m => (
              <div key={m.label} className="bg-white border border-border rounded-2xl px-5 py-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-ink3 font-medium uppercase tracking-[0.06em]">{m.label}</div>
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-lg ${m.iconBg}`}>{m.icon}</div>
                </div>
                <div className="text-[28px] font-semibold text-ink tracking-[-0.5px] mb-1">{m.value}</div>
                <div className={`text-[11px] ${m.change >= 0 ? 'text-teal' : 'text-rose'}`}>
                  {m.change >= 0 ? '↑' : '↓'} {Math.abs(m.change)}% vs last month
                </div>
              </div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-[2fr_1fr] gap-3.5 mb-7">

            {/* Bar chart */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-ink">Bookings over time</div>
                  <div className="text-[11px] text-ink3 mt-0.5">Confirmed bookings per month</div>
                </div>
                <div className="text-[11px] px-2.5 py-1 rounded-full bg-ink text-white">6M</div>
              </div>
              {barData.every(b => b.count === 0) ? (
                <div className="h-30 flex items-center justify-center text-xs text-ink3">No bookings yet</div>
              ) : (
                <div className="flex items-end gap-2 h-30 pt-2">
                  {barData.map(b => (
                    <div key={b.key} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-[9px] text-ink2 font-medium font-mono">{b.count > 0 ? b.count : ''}</div>
                      <div
                        className={`w-full rounded-t-[4px] min-h-[3px] ${b.highlight ? 'bg-ink' : 'bg-blue-lt'}`}
                        style={{ height: `${Math.max(b.pct, 3)}%` }}
                      />
                      <div className="text-[9px] text-ink3 font-mono">{b.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Donut chart */}
            <div className="bg-white border border-border rounded-2xl p-5">
              <div className="mb-4">
                <div className="text-sm font-semibold text-ink">Bookings by event type</div>
                <div className="text-[11px] text-ink3 mt-0.5">All time</div>
              </div>
              {donutSegments.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-xs text-ink3">No bookings yet</div>
              ) : (
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative flex-shrink-0" style={{ width: 90, height: 90 }}>
                    <div className="w-full h-full rounded-full" style={{ background: donutGradient }} />
                    <div className="absolute inset-[16px] bg-white rounded-full flex items-center justify-center text-xs font-bold text-ink">
                      {totalEvents}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {donutSegments.map(d => (
                      <div key={d.type} className="flex items-center gap-1.5 text-[11px] text-ink2">
                        <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                        {d.type} ({d.pct}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Availability calendar (interactive client component) ── */}
          <div className="mb-7">
            <AvailabilityCalendar
              supplierId={sid}
              initialBlockedDates={(blockedDates ?? []).map(r => r.blocked_date)}
              bookedDates={(allBookings as Booking[] ?? [])
                .filter(b => b.status === 'confirmed' || b.status === 'completed')
                .map(b => b.event_date)}
            />
          </div>

          {/* ── Inquiries table ── */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-5 border-b border-border">
              <div>
                <div className="text-sm font-semibold text-ink">Recent inquiries</div>
                <div className="text-[11px] text-ink3 mt-0.5">Respond within 24h to maintain your response badge</div>
              </div>
              <Link href="/partner/inquiries">
                <button className="text-[11px] font-semibold px-3 py-[6px] rounded-full bg-ink text-white border-none cursor-pointer font-sans">
                  View all
                </button>
              </Link>
            </div>
            {(recentInquiries as Inquiry[] ?? []).length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-ink3">
                No inquiries yet — your listing will start receiving them once planners find you.
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Client', 'Event type', 'Date', 'Guests', 'Budget', 'Status'].map(h => (
                      <th key={h} className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink3 px-3 py-2.5 text-left border-b border-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(recentInquiries as Inquiry[]).map(row => (
                    <tr key={row.id} className="hover:bg-cream transition-colors">
                      <td className="px-3 py-3 border-b border-border">
                        <div className="text-[13px] font-medium text-ink">{row.planner_name}</div>
                        {row.planner_location && <div className="text-[11px] text-ink3">{row.planner_location}</div>}
                      </td>
                      <td className="text-[13px] text-ink2 px-3 py-3 border-b border-border">{row.event_type}</td>
                      <td className="text-[13px] text-ink2 px-3 py-3 border-b border-border font-mono">
                        {row.event_date ? new Date(row.event_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="text-[13px] text-ink2 px-3 py-3 border-b border-border">{row.guest_count ?? '—'}</td>
                      <td className="text-[13px] text-ink2 px-3 py-3 border-b border-border font-mono">
                        {row.budget_min && row.budget_max ? `$${row.budget_min}–${row.budget_max}` : '—'}
                      </td>
                      <td className="px-3 py-3 border-b border-border">
                        <span className={`text-[10px] font-semibold px-[9px] py-[3px] rounded-full capitalize ${STATUS_STYLES[row.status] ?? 'bg-warm text-ink2'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
