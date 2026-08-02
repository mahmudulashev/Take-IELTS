import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithGoogle, getSession, completeOAuthSignIn } from '../lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      const isOAuthCallback =
        window.location.search.includes('code=') ||
        window.location.search.includes('error=') ||
        window.location.hash.includes('access_token')

      if (isOAuthCallback) setLoading(true)

      try {
        const session = isOAuthCallback
          ? await completeOAuthSignIn()
          : await getSession()

        if (active && session?.user) {
          navigate('/dashboard', { replace: true })
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Google orqali kirish yakunlanmadi. Qayta urinib ko\'ring.')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      active = false
    }
  }, [navigate])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
      setError('Google orqali kirishda xatolik yuz berdi. Supabase sozlamalarini tekshiring.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center items-center px-4 py-12">
      {/* Back to Home Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-gray-500 hover:text-[#FF3131] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Bosh sahifaga qaytish</span>
      </Link>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-[24px] p-8 md:p-10 border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
        {/* Brand Badge */}
        <div className="w-12 h-12 bg-[#FF3131] rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-6 shadow-md shadow-[#FF3131]/20">
          IE
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Hisobingizga kiring</h1>
        <p className="text-sm text-gray-500 mb-8">
          IELTS mock testlarini yechish va natijalaringizni saqlash uchun tizimga kiring
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-left border border-red-100">
            {error}
          </div>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm transition-ui shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-[#FF3131] rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Google bilan kirish</span>
        </button>

        <div className="mt-8 text-xs text-gray-400">
          <p>Ro'yxatdan o'tish bepul. Google orqali 1 soniyada kirishingiz mumkin.</p>
        </div>
      </div>
    </div>
  )
}
