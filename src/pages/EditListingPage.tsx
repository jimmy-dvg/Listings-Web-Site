import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { fetchOwnedListingForEdit, updateOwnedListingWithPhotos } from '../lib/listings'

export function EditListingPage() {
  const { id } = useParams()
  const { session } = useSession()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [currentPhotos, setCurrentPhotos] = useState<Array<{ path: string; url: string }>>([])
  const [removePhotoPaths, setRemovePhotoPaths] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadListing = async () => {
      if (!id || !session?.user.id) {
        setLoading(false)
        return
      }

      try {
        setError('')
        const listing = await fetchOwnedListingForEdit({ listingId: id, userId: session.user.id })

        if (!active) {
          return
        }

        if (!listing) {
          setError('Listing not found or not owned by your account.')
          setLoading(false)
          return
        }

        setTitle(listing.title)
        setLocation(listing.location)
        setPrice(String(listing.price))
        setDescription(listing.description)
        setCurrentPhotos(listing.photos.map((photo) => ({ path: photo.path, url: photo.url })))
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load listing.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadListing()

    return () => {
      active = false
    }
  }, [id, session?.user.id])

  const toggleRemovePhoto = (path: string) => {
    setRemovePhotoPaths((current) =>
      current.includes(path) ? current.filter((item) => item !== path) : [...current, path],
    )
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id || !session?.user.id) {
      setError('You must be logged in to edit this property.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await updateOwnedListingWithPhotos({
        listingId: id,
        userId: session.user.id,
        listing: {
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          location: location.trim(),
        },
        newFiles,
        removePhotoPaths,
      })

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update property.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading property...</p>
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Property for Sale</h1>
      <p className="text-slate-600">Modify property fields, add new photos, and remove old photos.</p>

      <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Title</span>
          <input
            id="edit-title"
            name="title"
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
            id="edit-location"
            name="location"
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
            id="edit-price"
            name="price"
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
            id="edit-description"
            name="description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Current photos (select to remove)</p>
          {currentPhotos.length === 0 ? <p className="text-sm text-slate-500">No photos uploaded yet.</p> : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentPhotos.map((photo) => {
              const selected = removePhotoPaths.includes(photo.path)
              return (
                <button
                  key={photo.path}
                  type="button"
                  onClick={() => toggleRemovePhoto(photo.path)}
                  className={`overflow-hidden rounded-xl border ${selected ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200'}`}
                >
                  <img src={photo.url} alt="Listing photo" className="h-24 w-full object-cover" />
                </button>
              )
            })}
          </div>
        </div>

        <label className="block space-y-2 text-sm text-slate-700">
          <span>Add new photos</span>
          <input
            id="edit-new-photos"
            name="newPhotos"
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setNewFiles(Array.from(event.target.files ?? []))}
            className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>
          <Link to="/dashboard" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
            Cancel
          </Link>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  )
}
