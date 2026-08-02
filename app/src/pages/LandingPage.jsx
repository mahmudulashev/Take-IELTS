import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Headphones, BarChart3, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Agar allaqachon login qilingan bo'lsa, to'g'ridan-to'g'ri Dashboard-ga o'tish
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const features = [
    {
      icon: BookOpen,
      title: 'Reading Test Simulator',
      desc: '3 ta murakkab passage, 40 ta haqiqiy IELTS savoli va 60 daqiqalik taymer bilan bilimingizni sinang.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: Headphones,
      title: 'Listening Test Simulator',
      desc: 'Audio player, 4 ta Part bo\'yicha 40 ta savol, audioni tezlashtirish va transkript bilan tahlil.',
      color: 'bg-[#FFF0F0] text-[#FF3131]'
    },
    {
      icon: BarChart3,
      title: 'Aniqlik va Natijalar Tahlili',
      desc: 'Test tugashi bilan 0.0 dan 9.0 gacha rasmiy IELTS Band score va to\'g\'ri javoblar bo\'yicha to\'liq hisobot.',
      color: 'bg-green-50 text-green-600'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F0] text-[#FF3131] text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Computer-Delivered IELTS Simulation</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight md:leading-none tracking-tight mb-6">
          IELTS Imtihoniga <br className="hidden md:inline" />
          <span className="text-[#FF3131]">Haqiqiy Formatda</span> Tayyorlaning
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Google orqali bir zumda kirib, Reading va Listening mock testlarini topshiring, band score va natijalaringizni shaxsiy profildan kuzatib boring.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[#FF3131] text-white hover:bg-[#E82C2C] transition-all shadow-lg shadow-[#FF3131]/25 hover:shadow-xl hover:shadow-[#FF3131]/35 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{user ? "Dashboard-ga O'tish" : "Testni Boshlash"}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Bepul ro'yxatdan o'tish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Google bilan 1-click login</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Red Banner Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#FF3131] to-[#FF6B6B] rounded-[24px] p-10 md:p-14 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-[#FF3131]/20">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold mb-3">Orzudagi Band Score ga Yering!</h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              Vaqtni boy bermang, hoziroq bepul akkount yarating va haqiqiy imtihon muhitini tajriba qiling.
            </p>
          </div>
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="px-8 py-4 rounded-full text-base font-bold bg-white text-[#FF3131] hover:bg-gray-50 transition-all shadow-lg hover:scale-105 active:scale-100 whitespace-nowrap"
          >
            {user ? "Dashboard →" : "Ro'yxatdan o'tish →"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200/60 text-center text-xs text-gray-400">
        <p>© 2026 Take IELTS. All rights reserved.</p>
      </footer>
    </div>
  )
}
