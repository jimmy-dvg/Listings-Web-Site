import { Link, NavLink, Outlet } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useSession } from './hooks/useSession'

export function AppLayout() {
  const { session } = useSession()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
            TinyListings
          </Link>

          <nav className="flex items-center gap-3 text-sm text-slate-700">
            <NavLink to="/" className="rounded-md px-3 py-2 hover:bg-slate-100">
              Browse
            </NavLink>
            <NavLink to="/dashboard" className="rounded-md px-3 py-2 hover:bg-slate-100">
              Dashboard
            </NavLink>
            {session ? (
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2"
                onClick={() => {
                  void supabase.auth.signOut()
                }}
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white">
                Login
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
