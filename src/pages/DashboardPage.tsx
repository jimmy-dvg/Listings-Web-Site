import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import { fetchMyListingsPage } from '../lib/listings'
import type { Listing } from '../types/listing'

const PAGE_SIZE = 6

export function DashboardPage() {
  const { session } = useSession()
  const [page, setPage] = useState(1)
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadListings = async () => {
      if (!session?.user.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await fetchMyListingsPage({ userId: session.user.id, page, pageSize: PAGE_SIZE })
        if (active) {
          setListings(data.listings)
          setTotal(data.total)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load your listings.')
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
  }, [page, session?.user.id])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My Listings</h1>
        <Link
          to="/dashboard/publish"
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          Publish listing
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-sm text-slate-600">Loading your listings...</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error && listings.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            You have no listings yet.
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
          <article
            key={listing.id}
            className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">{listing.title}</h2>
              <p className="text-sm text-slate-600">{listing.location}</p>
              <p className="mt-2 text-xs text-slate-500">Created {new Date(listing.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/dashboard/edit/${listing.id}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800"
              >
                Edit
              </Link>
              <Link
                to={`/dashboard/delete/${listing.id}`}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
              >
                Delete
              </Link>
            </div>
          </article>
          ))}
        </div>

        {!loading && !error && listings.length > 0 ? (
          <div className="flex items-center gap-2 pt-2">
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
        ) : null}
      </div>
    </section>
  )
}
