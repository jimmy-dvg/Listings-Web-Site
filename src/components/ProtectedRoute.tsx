import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useSession()

  if (loading) {
    return <p className="text-sm text-slate-600">Checking session...</p>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
