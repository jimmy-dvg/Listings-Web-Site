import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteMyListingById } from '../lib/listings'

export function DeleteListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = confirmText.trim().toUpperCase() === 'DELETE' && Boolean(id)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!id || !canSubmit) {
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      await deleteMyListingById(id)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete listing.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Delete Listing</h1>
      <p className="text-slate-600">Confirm deletion for listing {id}. This action cannot be undone.</p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Type DELETE to confirm</span>
          <input
            type="text"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Deleting...' : 'Delete listing'}
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
