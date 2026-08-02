import React from 'react'

/**
 * Butun ilovani o'rab turuvchi xato tutuvchi (Error Boundary).
 *
 * React'da render paytida tashlangan xato tutilmasa, butun daraxt
 * unmount bo'ladi va foydalanuvchi oq ekranni ko'radi. Bu komponent
 * shu holatni tutib, tushunarli xabar va chiqish yo'lini ko'rsatadi.
 *
 * MUHIM: ErrorBoundary faqat render, lifecycle va konstruktor
 * xatolarini tutadi. Quyidagilarni TUTMAYDI:
 *   - event handler ichidagi xatolar (onClick va h.k.)
 *   - setTimeout / setInterval ichidagi xatolar
 *   - async/await va Promise rejection'lar
 * Shuning uchun main.jsx da qo'shimcha window.onerror va
 * unhandledrejection tinglovchilari ham bor.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Bu yerga keyinchalik Sentry kabi xizmatni ulash mumkin
    console.error('[ErrorBoundary] tutilgan xato:', error, info?.componentStack)
  }

  handleRetry = () => {
    // Avval qayta render qilib ko'ramiz — sahifani yangilamasdan.
    // Agar xato takrorlansa, foydalanuvchi "Sahifani yangilash" ni bosadi.
    this.setState({ error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    const { error } = this.state

    if (!error) return this.props.children

    const isDev = import.meta.env.DEV

    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] max-w-lg w-full p-8 border border-gray-100 shadow-sm text-center">

          <div className="w-14 h-14 bg-[#FFF0F0] text-[#FF3131] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="text-lg font-extrabold text-gray-900 mb-2">
            Nimadir noto'g'ri ketdi
          </h1>

          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            Sahifani ko'rsatishda kutilmagan xato yuz berdi. Bu sizning
            aybingiz emas — muammo bizning tomonimizda.
          </p>

          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Topshirgan testlaringiz va natijalaringiz saqlanib qoldi,
            ular yo'qolmaydi.
          </p>

          {isDev && (
            <pre className="text-left text-[11px] bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6 overflow-auto max-h-40 text-red-600 font-mono">
              {error?.stack || String(error)}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="w-full sm:flex-1 py-3 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-xs transition-colors active:scale-95"
            >
              Qayta urinish
            </button>
            <button
              onClick={this.handleReload}
              className="w-full sm:flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              Sahifani yangilash
            </button>
            <button
              onClick={this.handleGoHome}
              className="w-full sm:flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              Bosh sahifa
            </button>
          </div>

        </div>
      </div>
    )
  }
}
