import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  const url = new URL(request.url)
  const origin = url.origin
  const from = url.searchParams.get('from') // 'partner' | null

  if (!userId) {
    const dest = from === 'partner' ? '/partner/sign-in' : '/sign-in'
    return NextResponse.redirect(new URL(dest, origin))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()

  if (from === 'partner') {
    // Partner journey: existing listing → dashboard, no listing → wizard
    const dest = supplier ? '/partner/dashboard' : '/partner/sign-up'
    return NextResponse.redirect(new URL(dest, origin))
  }

  // Planner journey: always home, regardless of whether they also have a listing
  return NextResponse.redirect(new URL('/', origin))
}
