import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../hooks/useSession'

export function RegisterPage() {
  const { session } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    setIsSubmitting(false)
    setMessage(error ? error.message : 'Registration successful. You can now login.')
  }

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
      <p className="text-sm text-slate-600">Create your account to publish and manage listings.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Name</span>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Email</span>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </label>
        <label className="block space-y-2 text-sm text-slate-700">
          <span>Password</span>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  )
}
