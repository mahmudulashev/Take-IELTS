import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import BandScoreChart from '../components/charts/BandScoreChart'
import SkillBreakdownCard from '../components/charts/SkillBreakdownCard'
import DeepAnalyticsSection from '../components/charts/DeepAnalyticsSection'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatSeconds } from '../lib/scoring'
import { BookOpen, Headphones, Calendar, CheckCircle2, XCircle, ChevronRight, X, BarChart3, Trash2 } from 'lucide-react'

export default function ReportsPage() {
  const { user, sessionChecked, signOut, results, clearHistory } = useAuth()
  const [activeTab, setActiveTab] = useState('reading') // 'reading' or 'listening'
  const [selectedResult, setSelectedResult] = useState(null) // For detail modal
  const [showClearModal, setShowClearModal] = useState(false)
  const navigate = useNavigate()

  // Correct answer keys for details analysis
  const readingKeys = {
    1: 'C', 2: 'C', 3: 'A', 4: 'B', 5: 'A',
    6: 'YES', 7: 'NO', 8: 'NO', 9: 'NOT GIVEN', 10: 'YES', 11: 'NOT GIVEN', 12: 'YES', 13: 'A',
    14: 'B', 15: 'C', 16: 'A', 17: 'D', 18: 'B', 19: 'A', 20: 'D', 21: 'C', 22: 'B',
    23: 'water', 24: 'energy', 25: 'forests', 26: 'temperature',
    27: 'B', 28: 'A', 29: 'C', 30: 'B', 31: 'A', 32: 'C',
    33: 'YES', 34: 'NO', 35: 'YES', 36: 'NOT GIVEN', 37: 'NO', 38: 'YES', 39: 'NO', 40: 'YES'
  }

  const listeningKeys = {
    1: 'headmaster', 2: '15th September', 3: 'park', 4: '45', 5: 'library',
    6: 'music', 7: 'uniform', 8: 'buses', 9: 'parents', 10: 'website',
    11: 'A', 12: 'C', 13: 'B', 14: 'A', 15: 'C',
    16: 'E', 17: 'B', 18: 'D', 19: 'A', 20: 'F',
    21: 'C', 22: 'A', 23: 'B', 24: 'C', 25: 'A', 26: 'B', 27: 'C', 28: 'A', 29: 'C', 30: 'B',
    31: 'ice', 32: 'volcano', 33: 'minerals', 34: 'research', 35: 'wind',
    36: 'temperature', 37: 'satellite', 38: 'expedition', 39: 'clothing', 40: 'safety'
  }

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

  const handleConfirmClear = async () => {
    await clearHistory()
    setShowClearModal(false)
  }

  const readingResults = results.filter(r => r.test_type === 'reading')
  const listeningResults = results.filter(r => r.test_type === 'listening')
  const currentTabResults = activeTab === 'reading' ? readingResults : listeningResults

  // Calculate average bands
  const getAvgBand = (arr) => {
    if (!arr.length) return '0.0'
    const sum = arr.reduce((acc, curr) => acc + parseFloat(curr.band_score || 0), 0)
    return (sum / arr.length).toFixed(1)
  }

  const bandBadgeClass = (band) => {
    const b = parseFloat(band)
    if (b >= 7.0) return 'bg-green-100 text-green-700'
    if (b >= 5.5) return 'bg-blue-100 text-blue-700'
    return 'bg-red-100 text-red-700'
  }

  const resultTestName = (res) =>
    res.test_id
      ? `${res.test_type === 'reading' ? 'Reading' : 'Listening'} Practice Test ${res.test_id.split('-')[1] || '1'}`
      : 'Practice Test'

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">
        {/* Page Header */}
        <div className="bg-white rounded-[24px] p-5 sm:p-6 md:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Natijalar Tahlili & Tarix</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
              Mening Natijalarim
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Topshirilgan testlar bo'yicha grafiklar va batafsil javoblar hisoboti.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            {/* Type Switcher Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('reading')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
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
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'listening'
                    ? 'bg-[#FF3131] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Listening ({listeningResults.length})</span>
              </button>
            </div>

            {/* Clear History Button */}
            {results.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Natijalarni Tozalash</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Cards for selected tab */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">Jami Topshirilgan</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{currentTabResults.length} ta test</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">O'rtacha Band Score</p>
            <p className="text-3xl font-extrabold text-[#FF3131] mt-1">{getAvgBand(currentTabResults)}</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase">Eng Yaxshi Ball</p>
            <p className="text-3xl font-extrabold text-green-600 mt-1">
              {currentTabResults.length
                ? Math.max(...currentTabResults.map(r => parseFloat(r.band_score || 0))).toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BandScoreChart results={currentTabResults} />
          </div>
          <div>
            <SkillBreakdownCard results={currentTabResults} testType={activeTab} />
          </div>
        </div>

        {/* Deeper Analytics — radar, accuracy ring, monthly compare, error heatmap, pacing, streak */}
        <DeepAnalyticsSection results={results} />

        {/* Detailed Results Table */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden w-full max-h-[600px] overflow-y-auto relative">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg">Topshirilgan Testlar Ro'yxati</h3>
            <span className="text-xs font-semibold text-gray-400">{currentTabResults.length} ta yozuv</span>
          </div>

          {currentTabResults.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-semibold text-sm">
              Ushbu bo'lim bo'yicha hali test topshirilmagan.
            </div>
          ) : (
            <div>
              {/* Desktop Table (>= 640px) */}
              <div className="hidden sm:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-gray-50 shadow-sm">
                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-4 px-6">#</th>
                      <th className="py-4 px-6">Sana & Vaqt</th>
                      <th className="py-4 px-6">Test Nomi</th>
                      <th className="py-4 px-6">To'g'ri Javoblar</th>
                      <th className="py-4 px-6">Band Score</th>
                      <th className="py-4 px-6">Sarflangan Vaqt</th>
                      <th className="py-4 px-6 text-right">Tahlil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
                    {currentTabResults.map((res, idx) => (
                      <tr key={res.id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 text-gray-400 font-normal">{idx + 1}</td>
                        <td className="py-4 px-6 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(res.completed_at || res.created_at || res.date)}</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-900">
                          {resultTestName(res)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-gray-900">{res.score}</span> / {res.total_questions || 40}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${bandBadgeClass(res.band_score)}`}>
                            {res.band_score}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          {formatSeconds(res.time_spent)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedResult(res)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#FFF0F0] text-gray-700 hover:text-[#FF3131] text-xs font-bold transition-colors"
                          >
                            <span>Batafsil Tahlil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (< 640px) */}
              <div className="sm:hidden divide-y divide-gray-100">
                {currentTabResults.map((res, idx) => (
                  <div key={res.id || idx} className="p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-extrabold text-gray-900 leading-snug">
                        {resultTestName(res)}
                      </span>
                      <span className={`shrink-0 inline-block px-3 py-1 rounded-full text-xs font-extrabold ${bandBadgeClass(res.band_score)}`}>
                        {res.band_score}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{formatDate(res.completed_at || res.created_at || res.date)}</span>
                      <span>•</span>
                      <span className="font-mono">{formatSeconds(res.time_spent)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">To'g'ri javoblar</p>
                        <p className="text-sm font-extrabold text-gray-900">{res.score} / {res.total_questions || 40}</p>
                      </div>
                      <button
                        onClick={() => setSelectedResult(res)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold transition-colors"
                      >
                        <span>Batafsil</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Natijalar tarixini tozalash</h3>
            <p className="text-xs text-gray-500 mb-6">
              Barcha topshirilgan testlar tarixi va grafik statistikalari o'chirib tashlanadi. Bu amalni ortga qaytarib bo'lmaydi!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
              >
                Ha, Barchasini O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Details Analysis Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Batafsil Savollar Tahlili
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedResult.completed_at || selectedResult.created_at)} · Band Score: <span className="font-bold text-[#FF3131]">{selectedResult.band_score}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body - 40 Questions Breakdown */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {Array.from({ length: 40 }).map((_, i) => {
                  const qNum = i + 1
                  const userAns = selectedResult.answers ? selectedResult.answers[qNum] : '—'
                  const keyMap = selectedResult.test_type === 'reading' ? readingKeys : listeningKeys
                  const correctAns = keyMap[qNum] || 'N/A'
                  const isCorrect = (userAns || '').toString().trim().toUpperCase() === (correctAns || '').toString().trim().toUpperCase()

                  return (
                    <div
                      key={qNum}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                        isCorrect ? 'bg-green-50/60 border-green-200' : 'bg-red-50/60 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-white border font-bold flex items-center justify-center text-gray-700">
                          {qNum}
                        </span>
                        <div>
                          <span className="text-gray-500 font-normal">Sizning javobingiz: </span>
                          <span className={`font-extrabold ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                            {userAns || 'Javob berilmadi'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-gray-400 font-normal text-[11px]">To'g'ri javob: </span>
                          <span className="font-extrabold text-gray-800">{correctAns}</span>
                        </div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
