import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BrowseListingsPage } from './pages/BrowseListingsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DeleteListingPage } from './pages/DeleteListingPage'
import { EditListingPage } from './pages/EditListingPage'
import { HomePage } from './pages/HomePage'
import { ListingDetailsPage } from './pages/ListingDetailsPage'
import { LoginPage } from './pages/LoginPage'
import { PublishListingPage } from './pages/PublishListingPage'
import { RegisterPage } from './pages/RegisterPage'

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
        path: 'listings',
        element: <BrowseListingsPage />,
      },
      {
        path: 'listing/:id',
        element: <ListingDetailsPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/publish',
        element: (
          <ProtectedRoute>
            <PublishListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'edit/:id',
        element: (
          <ProtectedRoute>
            <EditListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'delete/:id',
        element: (
          <ProtectedRoute>
            <DeleteListingPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
])
