import { auth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) return new Response('Unauthorized', { status: 401 })

    const body = await req.json()

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        clerk_user_id: userId,
        name: body.name,
        category: body.categories,
        city: body.city,
        price_min: body.priceMin,
        price_max: body.priceMax,
      })
      .select()

    if (error) throw error

    return Response.json({ supplier: data[0] })
  } catch (error) {
    console.error(error)
    return new Response('Failed', { status: 500 })
  }
}