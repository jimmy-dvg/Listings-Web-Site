import { Link, useParams } from 'react-router-dom'
import { mockListings } from '../data/mockListings'

export function ListingDetailsPage() {
  const { id } = useParams()
  const listing = mockListings.find((item) => item.id === id)

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
      <img src={listing.imageUrl} alt={listing.title} className="h-72 w-full rounded-2xl object-cover" />
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
        <p className="text-slate-600">{listing.city}</p>
        <p className="text-lg font-semibold text-slate-900">${listing.price} / month</p>
      </div>
      <p className="max-w-3xl text-slate-700">{listing.description}</p>
    </section>
  )
}
