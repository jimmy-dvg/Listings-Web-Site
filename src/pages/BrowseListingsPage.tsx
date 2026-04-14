import { useMemo, useState } from 'react'
import { ListingCard } from '../components/ListingCard'
import { mockListings } from '../data/mockListings'

const PAGE_SIZE = 2

export function BrowseListingsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return mockListings
    }

    return mockListings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.city.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query)
      )
    })
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedListings = filteredListings.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Browse Listings</h1>
        <p className="text-slate-600">Search listings and move across pages.</p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
        placeholder="Search by title, city or description"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 focus:border-slate-500 focus:outline-none"
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pagedListings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {pagedListings.length === 0 ? <p className="text-sm text-slate-600">No listings match your search.</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-sm text-slate-600">
          Page {safePage} of {totalPages}
        </p>
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )
}
