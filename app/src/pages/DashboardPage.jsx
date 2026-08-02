import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import BandScoreChart from '../components/charts/BandScoreChart'
import SkillBreakdownCard from '../components/charts/SkillBreakdownCard'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatSeconds } from '../lib/scoring'
import { Flame, Award, BookOpen, Headphones, ArrowRight, History, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, sessionChecked, signOut, results, stats } = useAuth()
  const [activeTab, setActiveTab] = useState('reading') // 'reading' or 'listening'
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
    const scrollLeft = e.target.scrollLeft
    const width = e.target.offsetWidth
    const newIndex = Math.round(scrollLeft / (width * 0.72))
    if (newIndex >= 0 && newIndex < 4 && newIndex !== currentSlide) {
      setCurrentSlide(newIndex)
    }
  }

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'IELTS Student'

  const readingResults = results.filter(r => r.test_type === 'reading')
  const listeningResults = results.filter(r => r.test_type === 'listening')
  const currentTabResults = activeTab === 'reading' ? readingResults : listeningResults

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

        {/* Charts & Skill Breakdown Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Natijalar Tahlili & Ko'nikmalar</h2>
            
            {/* Type Switcher Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('reading')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'reading'
                    ? 'bg-[#FF3131] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Reading ({readingResults.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('listening')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'listening'
                    ? 'bg-[#FF3131] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Listening ({listeningResults.length})</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BandScoreChart results={currentTabResults} />
            </div>
            <div>
              <SkillBreakdownCard results={currentTabResults} />
            </div>
          </div>
        </div>

        {/* Results History Section */}
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Natijalar tarixi</h2>
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden w-full max-h-[500px] overflow-y-auto relative">
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">Hali test yechilmagan. Birinchi testingizni boshlang!</p>
            </div>
          ) : (
            <div>
              {/* Desktop Table (>= 640px) */}
              <div className="hidden sm:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">Sana</th>
                      <th className="py-4 px-6">Test turi</th>
                      <th className="py-4 px-6">Ball</th>
                      <th className="py-4 px-6">Band</th>
                      <th className="py-4 px-6">Vaqt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
                    {results.map((res, index) => (
                      <tr key={res.id || index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-gray-400 font-normal">{index + 1}</td>
                        <td className="py-4 px-6">{formatDate(res.completed_at || res.created_at || res.date)}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              res.test_type === 'reading'
                                ? 'bg-[#FFF0F0] text-[#FF3131]'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {res.test_type === 'reading' ? '📖 Reading' : '🎧 Listening'}
                          </span>
                        </td>
                        <td className="py-4 px-6">{res.score} / {res.total_questions || 40}</td>
                        <td className="py-4 px-6">
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
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          {formatSeconds(res.time_spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (< 640px) */}
              <div className="sm:hidden divide-y divide-gray-100">
                {results.map((res, index) => (
                  <div key={res.id || index} className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          res.test_type === 'reading'
                            ? 'bg-[#FFF0F0] text-[#FF3131]'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {res.test_type === 'reading' ? '📖 Reading' : '🎧 Listening'}
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
                        Band {res.band_score}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">To'g'ri javoblar</p>
                        <p className="text-sm font-extrabold text-gray-900">{res.score} / {res.total_questions || 40}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 font-medium">Sana & Vaqt</p>
                        <p className="text-xs font-bold text-gray-700">
                          {formatDate(res.completed_at || res.created_at || res.date)} • {formatSeconds(res.time_spent)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
