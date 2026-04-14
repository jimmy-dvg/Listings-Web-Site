import { useParams } from 'react-router-dom'

export function EditListingPage() {
  const { listingId } = useParams()

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Edit listing</h1>
      <p className="text-slate-600">
        Editing form for listing <span className="font-mono">{listingId}</span> will be added in the next step.
      </p>
    </section>
  )
}
