import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchListingDetailsById } from '../lib/listings'
import type { ListingDetails } from '../lib/listings'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'

export function ListingDetailsPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<ListingDetails | null>(null)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
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
        const nextListing = await fetchListingDetailsById(id)
        if (active) {
          setListing(nextListing)
          setActivePhotoIndex(0)
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
        <h1 className="text-2xl font-semibold text-slate-900">Property not found</h1>
        <Link to="/listings" className="text-sm font-medium text-slate-700 underline">
          Go back to properties
        </Link>
      </section>
    )
  }

  const sliderPhotos = listing.photoUrls.length > 0 ? listing.photoUrls : [FALLBACK_IMAGE]
  const safeIndex = Math.min(activePhotoIndex, sliderPhotos.length - 1)

  const goPrevious = () => {
    setActivePhotoIndex((current) => (current - 1 + sliderPhotos.length) % sliderPhotos.length)
  }

  const goNext = () => {
    setActivePhotoIndex((current) => (current + 1) % sliderPhotos.length)
  }

  return (
    <section className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative">
          <img src={sliderPhotos[safeIndex]} alt={listing.title} className="h-80 w-full object-cover sm:h-[28rem]" />

          {sliderPhotos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 shadow"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 shadow"
              >
                Next
              </button>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-4 gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:grid-cols-6">
          {sliderPhotos.map((photoUrl, index) => (
            <button
              key={photoUrl}
              type="button"
              onClick={() => setActivePhotoIndex(index)}
              className={`overflow-hidden rounded-lg border ${
                safeIndex === index ? 'border-slate-900 ring-2 ring-slate-300' : 'border-slate-200'
              }`}
            >
              <img src={photoUrl} alt={`${listing.title} photo ${index + 1}`} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{listing.title}</h1>
          <p className="text-slate-600">{listing.location}</p>
          <p className="text-2xl font-bold text-slate-900">${listing.price.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Posted on {new Date(listing.createdAt).toLocaleDateString()}</p>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-slate-900">Description</h2>
            <p className="leading-7 text-slate-700">{listing.description}</p>
          </div>
        </article>

        <aside className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Seller Contacts</h2>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Name:</span> {listing.seller.name ?? 'Not provided'}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Email:</span> {listing.seller.email ?? 'Not provided'}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Phone:</span> {listing.seller.phoneNumber ?? 'Not provided'}
          </p>
        </aside>
      </div>
    </section>
  )
}
