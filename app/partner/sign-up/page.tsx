'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function PartnerSignUp() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    categories: [],
    city: 'Toronto',
    priceMin: 500,
    priceMax: 5000,
    phone: '',
  })

  const CATEGORIES = ['Venue', 'Caterer', 'Entertainer', 'Photographer', 'Florist']
  const CITIES = ['Toronto', 'Mississauga', 'Brampton', 'Vaughan']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/suppliers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed')
      router.push('/partner/dashboard')
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-ink mb-8">Join Fête as a Partner</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Business Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">What do you offer?</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, categories: [...formData.categories, cat] })
                      } else {
                        setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) })
                      }
                    }}
                    className="mr-2"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Service Area</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Min Rate (CAD)</label>
              <input
                type="number"
                value={formData.priceMin}
                onChange={(e) => setFormData({ ...formData, priceMin: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Max Rate (CAD)</label>
              <input
                type="number"
                value={formData.priceMax}
                onChange={(e) => setFormData({ ...formData, priceMax: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gold text-cream rounded-lg font-semibold hover:bg-gold-dk disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create My Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}