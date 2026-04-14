import { Link } from 'react-router-dom'
import type { Listing } from '../types/listing'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const createdDate = new Date(listing.createdAt).toLocaleDateString()
  const imageUrl =
    listing.coverImageUrl ??
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80'

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img src={imageUrl} alt={listing.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            ${listing.price}
          </span>
        </div>
        <p className="text-sm text-slate-600">{listing.location}</p>
        <p className="text-xs text-slate-500">Published {createdDate}</p>
        <Link
          to={`/listing/${listing.id}`}
          className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
