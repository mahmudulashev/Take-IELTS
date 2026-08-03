import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../lib/scoring'
import { Flame, Award, BookOpen, Headphones, PenLine, ArrowRight, History, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, sessionChecked, signOut, results, stats } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) { navigate('/auth'); return null }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleStatsScroll = (e) => {
    const track = e.currentTarget
    const firstCard = track.firstElementChild
    if (!firstCard) return
    // Stride = one card plus the flex gap between cards.
    const gap = parseFloat(getComputedStyle(track).columnGap) || 16
    const stride = firstCard.offsetWidth + gap
    if (!stride) return
    const newIndex = Math.min(3, Math.max(0, Math.round(track.scrollLeft / stride)))
    if (newIndex !== currentSlide) setCurrentSlide(newIndex)
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'IELTS Student'

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={handleSignOut} />

      {/* Main Dashboard Content */}
      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10 overflow-hidden">
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm mb-8 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full">
              XUSH KELIBSIZ
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
              Salom, {userName.split(' ')[0]}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              IELTS sayohatingizni davom ettiramiz!
            </p>
          </div>
        </motion.div>

        {/* Stats Cards — horizontal snap scroll on mobile, 4-col grid on desktop */}
        <div className="mb-8">
          {/* Mobile: Instagram-style snap carousel (< 640px) */}
          <div
            onScroll={handleStatsScroll}
            className="max-sm:flex hidden gap-4 overflow-x-auto -mx-4 px-4 snap-x snap-mandatory"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div style={{ minWidth: 'calc(100vw - 32px)' }} className="snap-center bg-gradient-to-br from-[#FF3131] to-[#FF6B6B] rounded-[20px] p-5 text-white shadow-lg shadow-[#FF3131]/20 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center mb-2">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <p className="text-[11px] font-medium opacity-90">Testlar soni</p>
              <p className="text-2xl font-extrabold mt-0.5">{stats.totalTests}</p>
            </div>

            <div style={{ minWidth: 'calc(100vw - 32px)' }} className="snap-center bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shrink-0">
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-[11px] font-medium text-gray-500">O'rtacha Band</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stats.avgBand}</p>
            </div>

            <div style={{ minWidth: 'calc(100vw - 32px)' }} className="snap-center bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shrink-0">
              <div className="w-9 h-9 rounded-lg bg-[#FFF0F0] flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-[#FF3131]" />
              </div>
              <p className="text-[11px] font-medium text-gray-500">Eng yaxshi</p>
              <p className="text-2xl font-extrabold text-[#FF3131] mt-0.5">{stats.bestBand}</p>
            </div>

            <div style={{ minWidth: 'calc(100vw - 32px)' }} className="snap-center bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm shrink-0">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <History className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] font-medium text-gray-500">So'nggi test</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                {stats.lastTest ? stats.lastTest.band_score : '—'}
              </p>
            </div>
          </div>

          {/* Mobile: carousel position dots */}
          <div className="max-sm:flex hidden justify-center gap-1.5 mt-3">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'w-[18px] bg-[#FF3131]' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Desktop: 4-col grid (>= 640px) */}
          <div className="max-sm:hidden grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#FF3131] to-[#FF6B6B] rounded-[24px] p-6 text-white shadow-lg shadow-[#FF3131]/20 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-medium opacity-90">Testlar soni</p>
                <p className="text-3xl font-extrabold mt-1">{stats.totalTests}</p>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-500">O'rtacha Band</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.avgBand}</p>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-[#FF3131]" />
              </div>
              <p className="text-xs font-medium text-gray-500">Eng yaxshi</p>
              <p className="text-3xl font-extrabold text-[#FF3131] mt-1">{stats.bestBand}</p>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-500">So'nggi test</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">
                {stats.lastTest ? stats.lastTest.band_score : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Practice Test Section Launchers */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Testlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Reading Launcher */}
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reading Testlari</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                3 passage · 40 savol · 60 daqiqa
              </p>
            </div>
            <Link
              to="/reading-packs"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#FF3131] text-white font-bold text-sm hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20 hover:shadow-lg"
            >
              <span>Boshlash →</span>
            </Link>
          </div>

          {/* Listening Launcher */}
          <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Listening Testlari</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                4 part · 40 savol · Audio
              </p>
            </div>
            <Link
              to="/listening-packs"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#FF3131] text-white font-bold text-sm hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20 hover:shadow-lg"
            >
              <span>Boshlash →</span>
            </Link>
          </div>
        </div>

        {/* Recent Results Summary — full charts, analytics & history now live on /reports */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-extrabold text-gray-900">Natijalar tarixi</h2>
          {results.length > 0 && (
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF3131] hover:text-[#E82C2C] transition-colors shrink-0"
            >
              <span>Barchasini ko'rish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">Hali test yechilmagan. Birinchi testingizni boshlang!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.slice(0, 3).map((res, index) => (
                <div key={res.id || index} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        res.test_type === 'reading'
                          ? 'bg-[#FFF0F0] text-[#FF3131]'
                          : res.test_type === 'writing'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {res.test_type === 'reading' ? (
                        <><BookOpen className="w-[13px] h-[13px]" />Reading</>
                      ) : res.test_type === 'writing' ? (
                        <><PenLine className="w-[13px] h-[13px]" />Writing</>
                      ) : (
                        <><Headphones className="w-[13px] h-[13px]" />Listening</>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {formatDate(res.completed_at || res.created_at || res.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                      {res.test_type === 'writing'
                        ? `${res.score} so'z`
                        : `${res.score} / ${res.total_questions || 40}`}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                        parseFloat(res.band_score) >= 7.0
                          ? 'bg-green-100 text-green-700'
                          : parseFloat(res.band_score) >= 5.5
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {res.band_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
