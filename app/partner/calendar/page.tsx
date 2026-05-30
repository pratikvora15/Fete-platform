import PartnerPageShell from '../_components/PartnerPageShell'
import AvailabilityCalendar from '../dashboard/_components/AvailabilityCalendar'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Booking = { event_date: string; status: string }

export default async function CalendarPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = db()
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!supplier) redirect('/partner/sign-up')

  const [{ data: blockedDates }, { data: bookings }] = await Promise.all([
    supabase.from('availability_blocks').select('blocked_date').eq('supplier_id', supplier.id),
    supabase.from('bookings').select('event_date, status').eq('supplier_id', supplier.id),
  ])

  return (
    <PartnerPageShell>
      <div className="px-8 py-8">
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-1">Calendar</div>
          <h1 className="text-2xl font-semibold text-ink">Availability</h1>
          <p className="text-[13px] text-ink2 mt-1">Block dates you're unavailable. Confirmed bookings are shown automatically.</p>
        </div>
        <div className="max-w-xl">
          <AvailabilityCalendar
            supplierId={supplier.id}
            initialBlockedDates={(blockedDates ?? []).map(r => r.blocked_date)}
            bookedDates={(bookings as Booking[] ?? [])
              .filter(b => b.status === 'confirmed' || b.status === 'completed')
              .map(b => b.event_date)}
          />
        </div>
      </div>
    </PartnerPageShell>
  )
}
