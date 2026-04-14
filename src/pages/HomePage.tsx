import { Link } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import { mockListings } from '../data/mockListings'

export function HomePage() {
  const latestListings = [...mockListings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {latestListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}
