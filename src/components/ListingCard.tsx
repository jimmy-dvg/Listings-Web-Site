import { Link } from 'react-router-dom'
import type { Listing } from '../types/listing'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <img src={listing.imageUrl} alt={listing.title} className="h-44 w-full object-cover" />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{listing.title}</h3>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            ${listing.price}
          </span>
        </div>
        <p className="text-sm text-slate-600">{listing.city}</p>
        <Link
          to={`/listings/${listing.id}`}
          className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          View details
        </Link>
      </div>
    </article>
  )
}
