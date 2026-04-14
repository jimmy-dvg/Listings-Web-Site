import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { useSession } from './hooks/useSession'
import { DashboardPage } from './pages/DashboardPage'
import { EditListingPage } from './pages/EditListingPage'
import { HomePage } from './pages/HomePage'
import { ListingDetailsPage } from './pages/ListingDetailsPage'
import { LoginPage } from './pages/LoginPage'
import { NewListingPage } from './pages/NewListingPage'

function ProtectedRoute() {
  const { session, loading } = useSession()

  if (loading) {
    return <p className="text-sm text-slate-600">Checking session...</p>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'listings/:listingId',
        element: <ListingDetailsPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'dashboard/new',
            element: <NewListingPage />,
          },
          {
            path: 'dashboard/:listingId/edit',
            element: <EditListingPage />,
          },
        ],
      },
    ],
  },
])
