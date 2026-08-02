import React, { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ReadingPacksPage = lazy(() => import('./pages/ReadingPacksPage'))
const ListeningPacksPage = lazy(() => import('./pages/ListeningPacksPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ReadingTestPage = lazy(() => import('./pages/ReadingTestPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
    </div>
  )
}

/**
 * Kirish animatsiyalarini faqat BIRINCHI yuklanishda qoldiradi.
 *
 * Foydalanuvchi sidebar/navbar orqali sahifa almashtirsa, React
 * komponentlarni qaytadan mount qiladi va kirish animatsiyasi har
 * safar qaytadan ishlaydi — bu bezovta qiladi. Birinchi
 * navigatsiyadan keyin <html> ga `spa-nav` klassi qo'shiladi va
 * index.css o'sha animatsiyalarni o'chiradi.
 *
 * Modal / xato oynasi / toast animatsiyalari bunga kirmaydi —
 * ular sahifa kirishi emas, foydalanuvchi amaliga javob.
 */
function NavAnimationGate() {
  const { pathname } = useLocation()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    document.documentElement.classList.add('spa-nav')
  }, [pathname])

  return null
}

export default function App() {
  return (
    <Router>
      <NavAnimationGate />
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reading-packs" element={<ReadingPacksPage />} />
            <Route path="/listening-packs" element={<ListeningPacksPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/test/reading" element={<ReadingTestPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}
