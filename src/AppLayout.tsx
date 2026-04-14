import { Outlet } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'

export function AppLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
