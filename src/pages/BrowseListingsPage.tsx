import { useEffect, useState } from 'react'
import { ListingCard } from '../components/ListingCard'
import { fetchListingsPage } from '../lib/listings'
import type { Listing } from '../types/listing'

const PAGE_SIZE = 6

export function BrowseListingsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadPage = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchListingsPage({ page, pageSize: PAGE_SIZE, search })
        if (active) {
          setListings(data.listings)
          setTotal(data.total)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load listings.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      active = false
    }
  }, [page, search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

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
        placeholder="Search by title, location or description"
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 focus:border-slate-500 focus:outline-none"
      />

      {loading ? <p className="text-sm text-slate-600">Loading listings...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : null}

      {!loading && !error && listings.length === 0 ? (
        <p className="text-sm text-slate-600">No listings match your search.</p>
      ) : null}

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
