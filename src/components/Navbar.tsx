import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSession } from '../hooks/useSession'

export function Navbar() {
  const { session } = useSession()

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-semibold tracking-tight text-slate-900">
          TinyListings
        </NavLink>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <NavLink to="/" className="rounded-md px-3 py-2 hover:bg-slate-100">
            Home
          </NavLink>
          <NavLink to="/listings" className="rounded-md px-3 py-2 hover:bg-slate-100">
            Browse Listings
          </NavLink>
          {session ? (
            <>
              <NavLink to="/dashboard" className="rounded-md px-3 py-2 hover:bg-slate-100">
                My Listings
              </NavLink>
              <NavLink to="/dashboard/publish" className="rounded-md px-3 py-2 hover:bg-slate-100">
                Publish
              </NavLink>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2"
                onClick={() => {
                  void supabase.auth.signOut()
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="rounded-md px-3 py-2 hover:bg-slate-100">
                Login
              </NavLink>
              <NavLink to="/register" className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
