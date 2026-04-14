import { ListingCard } from '../components/ListingCard'
import { mockListings } from '../data/mockListings'

export function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Discover Listings</h1>
        <p className="max-w-2xl text-slate-600">
          Browse available places. In the next step we will fetch these from Supabase instead of mock data.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mockListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  )
}
