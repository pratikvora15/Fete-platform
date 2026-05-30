import PartnerPageShell from '../_components/PartnerPageShell'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-gold-lt text-amber',
  confirmed: 'bg-teal-lt text-teal',
  completed: 'bg-blue-lt text-blue',
  declined:  'bg-rose-lt text-rose',
}

export default async function InquiriesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = db()
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!supplier) redirect('/partner/sign-up')

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('supplier_id', supplier.id)
    .order('created_at', { ascending: false })

  const rows = (inquiries as Inquiry[]) ?? []
  const pending = rows.filter(i => i.status === 'pending').length

  return (
    <PartnerPageShell>
      <div className="px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-1">Inquiries</div>
            <h1 className="text-2xl font-semibold text-ink">
              All inquiries
              {pending > 0 && (
                <span className="ml-2 text-sm font-semibold px-2 py-[2px] rounded-full bg-gold-lt text-amber">
                  {pending} pending
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {rows.length === 0 ? (
            <div className="px-5 py-14 text-center text-xs text-ink3">
              No inquiries yet. Your listing will start receiving them once planners find you.
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
                {rows.map(row => (
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
    </PartnerPageShell>
  )
}
