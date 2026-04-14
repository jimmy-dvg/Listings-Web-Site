import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchListingById } from '../lib/listings'
import type { Listing } from '../types/listing'

export function ListingDetailsPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadListing = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setError('')
        const nextListing = await fetchListingById(id)
        if (active) {
          setListing(nextListing)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load listing.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadListing()

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <p className="text-sm text-slate-600">Loading listing...</p>
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>
  }

  if (!listing) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Listing not found</h1>
        <Link to="/listings" className="text-sm font-medium text-slate-700 underline">
          Go back to listings
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <img
        src={listing.coverImageUrl ?? 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'}
        alt={listing.title}
        className="h-72 w-full rounded-2xl object-cover"
      />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
        <p className="text-slate-600">{listing.location}</p>
        <p className="text-lg font-semibold text-slate-900">${listing.price} / month</p>
      </div>
      <p className="max-w-3xl text-slate-700">{listing.description}</p>
    </section>
  )
}
