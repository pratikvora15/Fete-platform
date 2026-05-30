import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PartnerSidebar from './PartnerSidebar'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type Props = {
  children: React.ReactNode
}

export default async function PartnerPageShell({ children }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { data: supplier } = await db()
    .from('suppliers')
    .select('id, name, category, city, status')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (!supplier) redirect('/partner/sign-up')

  const { count: pendingCount } = await db()
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('supplier_id', supplier.id)
    .eq('status', 'pending')

  return (
    <div className="flex min-h-screen">
      <PartnerSidebar supplier={supplier} pendingCount={pendingCount ?? 0} />
      <main className="flex-1 flex flex-col overflow-x-auto bg-cream">
        {children}
      </main>
    </div>
  )
}
