import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Create users table if doesn't exist
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: body.email,
        first_name: body.firstName,
        joined_at: new Date(),
      })

    if (error) throw error

    return Response.json({ success: true })
  } catch (error) {
    console.error(error)
    return new Response('Failed', { status: 500 })
  }
}