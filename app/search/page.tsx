import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-cream px-6 py-12">
        <p className="text-ink2">Supabase configuration is missing.</p>
      </div>
    )
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const city = searchParams.city || 'Toronto'

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('*')
    .eq('city', city)

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white px-6 py-4">
        <h1 className="text-3xl font-bold text-ink">Search Results in {city}</h1>
        <p className="text-ink2">{suppliers?.length || 0} suppliers found</p>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {!suppliers || suppliers.length === 0 ? (
          <p className="text-ink2">No suppliers found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suppliers.map((supplier: any) => (
              <Link key={supplier.id} href={`/supplier/${supplier.id}`}>
                <div className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                  <h3 className="font-semibold text-ink text-lg mb-2">{supplier.name}</h3>
                  <p className="text-sm text-ink2 mb-4">{supplier.city}, Ontario</p>
                  <p className="text-gold font-semibold">${supplier.price_min} - ${supplier.price_max}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}