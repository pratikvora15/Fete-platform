import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  const origin = new URL(request.url).origin

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', origin))
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

  // Suppliers → their dashboard; everyone else → homepage (planner experience)
  return NextResponse.redirect(new URL(supplier ? '/partner/dashboard' : '/', origin))
}
