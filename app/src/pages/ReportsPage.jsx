import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import WritingReports from '../components/writing/WritingReports'
import { clearWritingHistory } from '../lib/writing'
import { PenLine, BarChart2, XCircle, X, BarChart3, Trash2, WifiOff, RefreshCw } from 'lucide-react'

/**
 * "Natijalarim" — Task 1 va Task 2 alohida tablarda.
 *
 * Ro'yxatni va tahlilni WritingReports chizadi; bu sahifa tab tanlash,
 * tarixni tozalash va aloqa xatosi bannerini boshqaradi.
 */
export default function ReportsPage() {
  const { user, sessionChecked, signOut, results, refreshResults, syncError } = useAuth()
  const [activeTab, setActiveTab] = useState('task1')
  const [showClearModal, setShowClearModal] = useState(false)
  const [deleteError, setDeleteError] = useState(null)
  const [retrying, setRetrying] = useState(false)
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

  const handleRetrySync = async () => {
    if (retrying) return
    setRetrying(true)
    await refreshResults()
    setRetrying(false)
  }

  const handleConfirmClear = async () => {
    setDeleteError(null)
    const res = await clearWritingHistory(activeTab)
    if (!res.ok) {
      // Jim muvaffaqiyatsizlikni yashirmaymiz — foydalanuvchi "tozalandi"
      // deb o'ylab, keyin natijalarni qayta ko'rmasin.
      console.error('Javoblarni o\'chirish xatosi:', res.error)
      setDeleteError(res.error)
    }
    await refreshResults()
    setShowClearModal(false)
  }

  // Task 1 va Task 2 alohida tablarda — aralashib ketmasin
  const taskOfRow = (r) => ((r.writing?.task_type || r.task_type) === 'task1' ? 'task1' : 'task2')
  const byTask = (task) => results.filter(r => r.test_type === 'writing' && taskOfRow(r) === task)
  const task1Results = byTask('task1')
  const task2Results = byTask('task2')
  const currentResults = activeTab === 'task1' ? task1Results : task2Results

  const TABS = [
    { id: 'task1', icon: BarChart2, label: 'Writing Task 1', count: task1Results.length },
    { id: 'task2', icon: PenLine, label: 'Writing Task 2', count: task2Results.length },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">
        {deleteError && (
          <div className="bg-white rounded-[20px] p-5 border border-red-200 shadow-sm mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-1">O'chirib bo'lmadi</p>
              <p className="text-xs text-gray-600 leading-relaxed">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-gray-400 hover:text-gray-900 shrink-0"
              aria-label="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bulut bilan aloqa uzilgan holat.
            MUHIM: bu bannersiz ekran "natija yo'q" deb ko'rinadi va
            foydalanuvchi ma'lumotlari o'chgan deb o'ylaydi. Aslida
            natijalar bazada turadi, shunchaki o'qib bo'lmayapti. */}
        {syncError && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-1">
                Natijalar to'liq ko'rsatilmayapti
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {syncError} Quyidagi ro'yxat faqat shu brauzerda saqlangan
                natijalardan iborat — <strong>ma'lumotlaringiz o'chmagan</strong>,
                aloqa tiklangach hammasi qaytadi.
              </p>
            </div>
            <button
              onClick={handleRetrySync}
              disabled={retrying}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-100 disabled:opacity-50 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Tekshirilmoqda…' : 'Qayta urinish'}</span>
            </button>
          </div>
        )}

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
              Yozilgan javoblar, AI bahosi va xatolar tahlili.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-full sm:w-auto overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#FF3131] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label} ({tab.count})</span>
                  </button>
                )
              })}
            </div>

            {currentResults.length > 0 && (
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

        <WritingReports key={activeTab} task={activeTab} results={currentResults} syncError={syncError} />
      </main>

      {/* Tozalashni tasdiqlash */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Javoblarni o'chirish</h3>
            <p className="text-xs text-gray-500 mb-6">
              {activeTab === 'task1' ? 'Task 1' : 'Task 2'} bo'yicha yozilgan {currentResults.length} ta
              javob, ularning matni va AI tahlili bazadan butunlay o'chiriladi.
              Bu amalni ortga qaytarib bo'lmaydi!
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
    </div>
  )
}
