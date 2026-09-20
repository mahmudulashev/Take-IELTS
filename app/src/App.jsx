import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const WritingPacksPage = lazy(() => import('./pages/WritingPacksPage'))
const WritingTestPage = lazy(() => import('./pages/WritingTestPage'))
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
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/writing-task1" element={<WritingPacksPage task="task1" />} />
            <Route path="/writing-task2" element={<WritingPacksPage task="task2" />} />
            <Route path="/writing-packs" element={<Navigate to="/writing-task1" replace />} />
            <Route path="/test/writing/:packId" element={<WritingTestPage />} />
            {/* Eski havolalar to'plamlar sahifasiga yo'naltiriladi */}
            <Route path="/test/writing" element={<Navigate to="/writing-task1" replace />} />
            {/* Reading/Listening olib tashlandi — eski havolalar bosh sahifaga.
                Tizimga kirgan foydalanuvchini LandingPage dashboardga o'tkazadi. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  )
}
