import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  signInWithGoogle, getSession, completeOAuthSignIn,
  signUpWithEmail, signInWithEmail, sendPasswordReset,
} from '../lib/supabase'
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

/** Rejimlar: kirish, ro'yxatdan o'tish, parolni tiklash */
const MODE = { LOGIN: 'login', SIGNUP: 'signup', RESET: 'reset' }

export default function AuthPage() {
  const [mode, setMode] = useState(MODE.LOGIN)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  // ----------------------------------------------------------------
  // OAuth qaytishi va mavjud sessiyani tekshirish
  // ----------------------------------------------------------------
  useEffect(() => {
    let active = true

    async function initializeAuth() {
      const isOAuthCallback =
        window.location.search.includes('code=') ||
        window.location.search.includes('error=') ||
        window.location.hash.includes('access_token')

      if (isOAuthCallback) setGoogleLoading(true)

      try {
        const session = isOAuthCallback
          ? await completeOAuthSignIn()
          : await getSession()

        if (active && session?.user) {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Kirish yakunlanmadi. Qayta urinib ko'ring.")
        }
      } finally {
        if (active) setGoogleLoading(false)
      }
    }

    initializeAuth()
    return () => { active = false }
  }, [navigate])

  // Rejim almashganda xabarlar tozalansin
  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setNotice(null)
    setPassword('')
  }

  // ----------------------------------------------------------------
  // Google
  // ----------------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
      setError('Google orqali kirishda xatolik. Supabase sozlamalarini tekshiring.')
      setGoogleLoading(false)
    }
  }

  // ----------------------------------------------------------------
  // Email + parol
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setError(null)
    setNotice(null)

    if (!email.trim()) return setError('Email manzilini kiriting.')

    // Parolni tiklash — parol talab qilinmaydi
    if (mode === MODE.RESET) {
      setLoading(true)
      const res = await sendPasswordReset(email)
      setLoading(false)
      if (!res.ok) return setError(res.error)
      return setNotice(
        `${email} manziliga parolni tiklash havolasi yuborildi. Pochtangizni tekshiring.`,
      )
    }

    if (password.length < 6) {
      return setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.")
    }

    setLoading(true)

    if (mode === MODE.SIGNUP) {
      const res = await signUpWithEmail({ email, password, fullName })
      setLoading(false)

      if (!res.ok) return setError(res.error)

      // Odatda bu yerga kelmaydi: "Confirm email" o'chirilgan bo'lsa
      // signUp darhol session qaytaradi va pastdagi navigate ishlaydi.
      if (res.needsConfirmation) {
        return setNotice(
          `${email} manziliga tasdiqlash havolasi yuborildi. Havolani bosgach tizimga kira olasiz.`,
        )
      }
      return navigate('/dashboard', { replace: true })
    }

    const res = await signInWithEmail({ email, password })
    setLoading(false)
    if (!res.ok) return setError(res.error)
    navigate('/dashboard', { replace: true })
  }

  const title =
    mode === MODE.SIGNUP ? "Ro'yxatdan o'tish"
    : mode === MODE.RESET ? 'Parolni tiklash'
    : 'Hisobingizga kiring'

  const subtitle =
    mode === MODE.SIGNUP ? 'Bepul hisob yarating va natijalaringizni saqlang'
    : mode === MODE.RESET ? 'Email manzilingizni kiriting — tiklash havolasini yuboramiz'
    : 'IELTS mock testlarini yechish va natijalarni saqlash uchun'

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center items-center px-4 py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-gray-500 hover:text-[#FF3131] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Bosh sahifaga qaytish</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-[24px] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#FF3131] rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-6 shadow-md shadow-[#FF3131]/20">
            IE
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h1>
          <p className="text-sm text-gray-500 mb-7">{subtitle}</p>
        </div>

        {/* Kirish / Ro'yxatdan o'tish almashtirgichi */}
        {mode !== MODE.RESET && (
          <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 mb-6">
            <button
              onClick={() => switchMode(MODE.LOGIN)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                mode === MODE.LOGIN ? 'bg-[#FF3131] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => switchMode(MODE.SIGNUP)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                mode === MODE.SIGNUP ? 'bg-[#FF3131] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-100 leading-relaxed">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-5 p-4 rounded-xl bg-green-50 text-green-700 text-xs font-semibold border border-green-100 leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === MODE.SIGNUP && (
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ismingiz"
                autoComplete="name"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/10 outline-none text-sm transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email manzilingiz"
              autoComplete="email"
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/10 outline-none text-sm transition-colors"
            />
          </div>

          {mode !== MODE.RESET && (
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === MODE.SIGNUP ? 'Parol (kamida 6 ta belgi)' : 'Parol'}
                autoComplete={mode === MODE.SIGNUP ? 'new-password' : 'current-password'}
                required
                className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/10 outline-none text-sm transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-sm transition-colors shadow-md shadow-[#FF3131]/20 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {mode === MODE.SIGNUP ? "Ro'yxatdan o'tish"
              : mode === MODE.RESET ? 'Tiklash havolasini yuborish'
              : 'Kirish'}
          </button>
        </form>

        {/* Parolni unutdingizmi / orqaga */}
        <div className="text-center mt-4">
          {mode === MODE.LOGIN && (
            <button
              onClick={() => switchMode(MODE.RESET)}
              className="text-xs font-semibold text-gray-500 hover:text-[#FF3131] transition-colors"
            >
              Parolni unutdingizmi?
            </button>
          )}
          {mode === MODE.RESET && (
            <button
              onClick={() => switchMode(MODE.LOGIN)}
              className="text-xs font-semibold text-gray-500 hover:text-[#FF3131] transition-colors"
            >
              Kirish sahifasiga qaytish
            </button>
          )}
        </div>

        {/* Ajratgich */}
        {mode !== MODE.RESET && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">yoki</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FF3131] rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Google bilan kirish</span>
            </button>
          </>
        )}

        <p className="mt-7 text-[11px] text-gray-400 text-center leading-relaxed">
          Ro'yxatdan o'tish bepul. Natijalaringiz faqat sizga ko'rinadi.
        </p>
      </div>
    </div>
  )
}
