import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { createListingWithPhotos } from '../lib/listings'

export function PublishListingPage() {
  const { session } = useSession()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!session?.user.id) {
      setError('You must be logged in to publish a property.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await createListingWithPhotos({
        userId: session.user.id,
        listing: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          location: location.trim(),
        },
        files,
      })

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish property.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Create Property for Sale</h1>
      <p className="text-slate-600">Fill out property details and upload one or more photos.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Title</span>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span>Location</span>
          <input
            type="text"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span>Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span>Description</span>
          <textarea
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-700">
          <span>Photos (multiple files)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Publishing...' : 'Publish property'}
        </button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  )
}
