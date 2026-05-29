import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getSupplier(userId: string) {
  const { data } = await db()
    .from('suppliers')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle()
  return data
}

/* Block a date */
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { date } = await req.json()
  if (!date) return new Response('Missing date', { status: 400 })

  const supplier = await getSupplier(userId)
  if (!supplier) return new Response('Supplier not found', { status: 404 })

  const { error } = await db()
    .from('availability_blocks')
    .insert({ supplier_id: supplier.id, blocked_date: date })

  if (error && error.code !== '23505') { // ignore unique-constraint duplicates
    return new Response(error.message, { status: 500 })
  }

  return Response.json({ ok: true })
}

/* Unblock a date */
export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { date } = await req.json()
  if (!date) return new Response('Missing date', { status: 400 })

  const supplier = await getSupplier(userId)
  if (!supplier) return new Response('Supplier not found', { status: 404 })

  const { error } = await db()
    .from('availability_blocks')
    .delete()
    .eq('supplier_id', supplier.id)
    .eq('blocked_date', date)

  if (error) return new Response(error.message, { status: 500 })

  return Response.json({ ok: true })
}
