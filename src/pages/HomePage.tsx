import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ListingCard } from '../components/ListingCard'
import { fetchLatestListings } from '../lib/listings'
import type { Listing } from '../types/listing'

export function HomePage() {
  const [latestListings, setLatestListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadListings = async () => {
      try {
        setError('')
        const data = await fetchLatestListings(6)
        if (active) {
          setLatestListings(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load latest listings.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadListings()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome to TinyListings</h1>
        <p className="max-w-2xl text-slate-600">
          Find your next place quickly. Browse all listings or publish your own after login.
        </p>
        <Link to="/listings" className="inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Browse all listings
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Latest Listings</h2>
      </div>
      {loading ? <p className="text-sm text-slate-600">Loading latest listings...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
