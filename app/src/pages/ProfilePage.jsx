import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { 
  getProfile, 
  updateProfile, 
  isSupabaseConfigured,
  clearTestHistory
} from '../lib/supabase'
import { 
  User, 
  Mail, 
  Target, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Cloud, 
  CloudOff,
  Trash2, 
  Save, 
  Award,
  Flame,
  ShieldCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Clock
} from 'lucide-react'

export default function ProfilePage() {
  const { user, sessionChecked, signOut, stats, clearHistory } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const navigate = useNavigate()

  // Form State
  const [fullName, setFullName] = useState('')
  const [targetBand, setTargetBand] = useState('7.5')
  const [examDate, setExamDate] = useState('2026-10-15')

  // Custom Dropdown Open States
  const [isBandDropdownOpen, setIsBandDropdownOpen] = useState(false)
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false)

  // Calendar View Month/Year State
  const initialDate = new Date(examDate || '2026-10-15')
  const [calMonth, setCalMonth] = useState(initialDate.getMonth())
  const [calYear, setCalYear] = useState(initialDate.getFullYear())

  const bandRef = useRef(null)
  const dateRef = useRef(null)

  const bandOptions = ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']

  const uzbekMonths = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ]

  const weekDays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (bandRef.current && !bandRef.current.contains(event.target)) {
        setIsBandDropdownOpen(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!sessionChecked) return
    if (!user) { navigate('/auth'); return }

    async function loadUserData() {
      try {
        const p = await getProfile()
        setProfile(p)

        if (p) {
          setFullName(p.full_name || '')
          setTargetBand(p.target_band || '7.5')
          const d = p.exam_date || '2026-10-15'
          setExamDate(d)
          const parsedD = new Date(d)
          if (!isNaN(parsedD)) {
            setCalMonth(parsedD.getMonth())
            setCalYear(parsedD.getFullYear())
          }
        } else {
          setFullName(user?.user_metadata?.full_name || user?.user_metadata?.name || '')
        }
      } catch (err) {
        console.error('Profile loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, sessionChecked, navigate])

  // Avtomatik ravishda xabarni yashirish
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const updated = await updateProfile({
        full_name: fullName,
        target_band: targetBand,
        exam_date: examDate,
        bio: ''
      })
      setProfile(updated)
      setMessage({ type: 'success', text: 'Profil ma\'lumotlari muvaffaqiyatli saqlandi! ✨' })
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Profilni saqlashda xatolik yuz berdi.' })
    } finally {
      setSaving(false)
    }
  }

  const handleClearHistory = async () => {
    await clearHistory()
    setShowDeleteModal(false)
    setMessage({ type: 'success', text: 'Barcha testlar tarixi tozalandi. ✨' })
  }

  // Calendar Helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7 // Monday = 0

  const handleSelectDay = (day) => {
    const formattedMonth = String(calMonth + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const selected = `${calYear}-${formattedMonth}-${formattedDay}`
    setExamDate(selected)
    setIsDateDropdownOpen(false)
  }

  const handleQuickAddMonths = (monthsToAdd) => {
    const future = new Date()
    future.setMonth(future.getMonth() + monthsToAdd)
    const formattedMonth = String(future.getMonth() + 1).padStart(2, '0')
    const formattedDay = String(future.getDate()).padStart(2, '0')
    const selected = `${future.getFullYear()}-${formattedMonth}-${formattedDay}`
    setExamDate(selected)
    setCalMonth(future.getMonth())
    setCalYear(future.getFullYear())
    setIsDateDropdownOpen(false)
  }

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(calYear - 1)
    } else {
      setCalMonth(calMonth - 1)
    }
  }

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(calYear + 1)
    } else {
      setCalMonth(calMonth + 1)
    }
  }

  // Format examDate nicely
  const formatExamDateDisplay = (dateStr) => {
    if (!dateStr) return 'Sana tanlanmagan'
    const d = new Date(dateStr)
    if (isNaN(d)) return dateStr
    const day = d.getDate()
    const monthName = uzbekMonths[d.getMonth()]
    const year = d.getFullYear()
    return `${day}-${monthName}, ${year}`
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) { navigate('/auth'); return null }

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = profile?.full_name || 'IELTS Student'
  const userEmail = user?.email || 'student@ielts.uz'

  // Calculate days left to exam
  const daysLeft = examDate ? Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar user={user} onSignOut={signOut} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">
        {/* User Identity Header */}
        <div className="bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-sm mb-8 flex flex-col xl:flex-row items-center xl:items-center justify-between gap-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-full p-1 bg-gradient-to-tr from-[#FF3131] to-[#FF6B6B] shadow-lg shadow-[#FF3131]/20">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-3xl text-[#FF3131]">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900">{userName}</h1>
              <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
            </div>
          </div>

        </div>

        {/* System Message Alert (Toast Notification) */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`fixed top-8 right-8 z-50 p-4 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border max-w-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="leading-snug">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Grid Wrapper */}
        <div className="space-y-8">
          {/* Top Row: Target IELTS Goal Card & Profile Edit Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Target IELTS Goal Card */}
            <div className="lg:col-span-4 flex">
              <div className="w-full bg-gradient-to-br from-[#FF3B3B] to-[#E82C2C] rounded-[24px] p-6 lg:p-8 border border-[#FF3B3B]/20 shadow-lg shadow-[#FF3131]/20 flex flex-col relative overflow-hidden group text-white">
                {/* Decorative Background Blobs */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-black/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

                <div className="flex flex-col items-center justify-center text-center mb-6 mt-2 relative z-10">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-30"></div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#FF3131] shadow-xl shadow-black/10 transform -rotate-3 relative z-10 border-[3px] border-white/50">
                      <span className="text-2xl font-black tracking-tighter">{targetBand}</span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-white" />
                    <span>IELTS Maqsadingiz</span>
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 font-medium">Orzuyingizdagi natijaga erishing</p>
                </div>

                <div className="space-y-2.5 relative z-10 w-full mt-auto">
                  <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Imtihon Sanasi</p>
                      <p className="text-sm font-black text-white">{formatExamDateDisplay(examDate)}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Qolgan Vaqt</p>
                      <p className="text-sm font-black text-white">{daysLeft} kun qoldi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Edit Form */}
            <div className="lg:col-span-8 flex">
              <div className="w-full bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col">
                <h2 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#FF3131]" />
                  <span>Shaxsiy Ma'lumotlarni Tahrirlash</span>
                </h2>

                <form onSubmit={handleSaveProfile} className="space-y-6 flex-1 flex flex-col">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      To'liq Ismingiz
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ismingiz va familiyangiz"
                        required
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 outline-none text-sm font-semibold text-gray-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Custom Target Band Dropdown */}
                    <div className="relative" ref={bandRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Maqsadli IELTS Balli
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsBandDropdownOpen(!isBandDropdownOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 bg-white text-left flex items-center justify-between text-sm font-semibold text-gray-900 shadow-xs hover:border-gray-300 transition-all"
                      >
                        <span>Band {targetBand}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isBandDropdownOpen ? 'rotate-180 text-[#FF3131]' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isBandDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 top-full z-40 bg-white rounded-2xl border border-gray-100 shadow-xl p-2 space-y-1"
                          >
                            {bandOptions.map((band) => (
                              <button
                                key={band}
                                type="button"
                                onClick={() => {
                                  setTargetBand(band)
                                  setIsBandDropdownOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                  targetBand === band
                                    ? 'bg-[#FFF0F0] text-[#FF3131]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>Band {band}</span>
                                {targetBand === band && <Check className="w-4 h-4 text-[#FF3131]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Custom Calendar Date Picker Dropdown */}
                    <div className="relative" ref={dateRef}>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Kutilayotgan Imtihon Sanasi
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 bg-white text-left flex items-center justify-between text-sm font-semibold text-gray-900 shadow-xs hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-[#FF3131]" />
                          <span>{formatExamDateDisplay(examDate)}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180 text-[#FF3131]' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDateDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 4, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 left-0 sm:left-auto sm:w-80 top-full z-50 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 space-y-4 mt-1"
                          >
                            {/* Calendar Month & Year Navigation Header */}
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <span className="font-extrabold text-xs text-gray-900">
                                {uzbekMonths[calMonth]} {calYear}
                              </span>
                              <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Weekday Names Header */}
                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase">
                              {weekDays.map(d => (
                                <div key={d} className="py-1">{d}</div>
                              ))}
                            </div>

                            {/* Days Matrix */}
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} />
                              ))}
                              {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const formattedMonth = String(calMonth + 1).padStart(2, '0')
                                const formattedDay = String(day).padStart(2, '0')
                                const dayStr = `${calYear}-${formattedMonth}-${formattedDay}`
                                const isSelected = examDate === dayStr

                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelectDay(day)}
                                    className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                      isSelected
                                        ? 'bg-[#FF3131] text-white shadow-md shadow-[#FF3131]/20 scale-105'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Quick Preset Buttons */}
                            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickAddMonths(1)}
                                className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-[#FFF0F0] text-gray-600 hover:text-[#FF3131] text-[11px] font-bold transition-all text-center"
                              >
                                +1 oydan keyin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAddMonths(2)}
                                className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-[#FFF0F0] text-gray-600 hover:text-[#FF3131] text-[11px] font-bold transition-all text-center"
                              >
                                +2 oydan keyin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAddMonths(3)}
                                className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-[#FFF0F0] text-gray-600 hover:text-[#FF3131] text-[11px] font-bold transition-all text-center"
                              >
                                +3 oydan keyin
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAddMonths(6)}
                                className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-[#FFF0F0] text-gray-600 hover:text-[#FF3131] text-[11px] font-bold transition-all text-center"
                              >
                                +6 oydan keyin
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="pt-2 mt-auto">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF3131] text-white font-bold text-xs hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20 active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Row: Supabase Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              {/* Supabase Cloud & Data Actions */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  {isSupabaseConfigured ? <Cloud className="w-4 h-4 text-blue-500" /> : <CloudOff className="w-4 h-4 text-gray-400" />}
                  <span>Bulut va Natijalar Boshqaruvi</span>
                </h3>

                <div className="text-xs text-gray-500 leading-relaxed">
                  {isSupabaseConfigured
                    ? 'Test natijalaringiz avtomatik tarzda bulutga saqlanadi — hech narsa bosishingiz shart emas.'
                    : 'Hozircha `.env` faylida Supabase kalitlari belgilanmagan. Sozlaganingizdan so\'ng Google OAuth va bulut saqlash ishga tushadi.'}
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Natijalar Tarixini Tozalash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Natijalar tarixini tozalash</h3>
            <p className="text-xs text-gray-500 mb-6">
              Barcha topshirilgan testlar tarixi va statistikangiz o'chirib tashlanadi. Bu amalni ortga qaytarib bo'lmaydi!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleClearHistory}
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
