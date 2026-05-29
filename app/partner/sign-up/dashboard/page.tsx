import { auth } from '@clerk/nextjs'

export default async function Dashboard() {
  const { userId } = auth()

  if (!userId) {
    return <div className="text-center mt-20">Please sign in</div>
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white px-6 py-4">
        <h1 className="text-3xl font-bold text-ink">Supplier Dashboard</h1>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ink mb-2">Pending Inquiries</h3>
            <p className="text-4xl font-bold text-gold">0</p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ink mb-2">Upcoming Bookings</h3>
            <p className="text-4xl font-bold text-teal">0</p>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-ink mb-2">Profile Status</h3>
            <p className="text-4xl font-bold text-blue">100%</p>
          </div>
        </div>
      </div>
    </div>
  )
}