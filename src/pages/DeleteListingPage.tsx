import { useParams } from 'react-router-dom'

export function DeleteListingPage() {
  const { id } = useParams()

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Delete Listing</h1>
      <p className="text-slate-600">Protected page with empty delete confirmation form for listing {id}.</p>
      <form className="space-y-4">
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Type DELETE to confirm</span>
          <input type="text" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <button type="button" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">
          Delete listing
        </button>
      </form>
    </section>
  )
}
