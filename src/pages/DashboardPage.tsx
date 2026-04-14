import { Link } from 'react-router-dom'
import { mockListings } from '../data/mockListings'

export function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My Listings</h1>
        <Link
          to="/dashboard/new"
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          New listing
        </Link>
      </div>

      <div className="space-y-3">
        {mockListings.map((listing) => (
          <article
            key={listing.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{listing.title}</h2>
              <p className="text-sm text-slate-600">{listing.city}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/dashboard/${listing.id}/edit`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800"
              >
                Edit
              </Link>
              <button
                type="button"
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
