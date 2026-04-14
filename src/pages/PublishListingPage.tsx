export function PublishListingPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create Listing</h1>
      <p className="text-slate-600">Protected page with empty publish form placeholder.</p>
      <form className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <textarea
          placeholder="Description"
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Publish
        </button>
      </form>
    </section>
  )
}
