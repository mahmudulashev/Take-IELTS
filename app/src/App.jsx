import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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

export default function App() {
  return (
    <Router>
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
    </Router>
  )
}
