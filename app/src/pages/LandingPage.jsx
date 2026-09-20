import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { BarChart2, PenLine, Sparkles, CheckCircle2, ArrowRight, Target } from 'lucide-react'

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
      icon: BarChart2,
      title: 'Task 1 — Grafik tasviri',
      desc: 'Bar, line, pie chart va jadval. 20 daqiqa, kamida 150 so\'z. Grafikdagi raqamlar AI\'ga ham beriladi, shuning uchun u noto\'g\'ri keltirilgan ma\'lumotni aniq ko\'rsatadi.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: PenLine,
      title: 'Task 2 — Insho',
      desc: '40 daqiqa, kamida 250 so\'z. Mavzular to\'plami o\'zgarmas: bir mavzuni qayta yozib, o\'z o\'sishingizni raqamlarda ko\'rasiz.',
      color: 'bg-[#FFF0F0] text-[#FF3131]'
    },
    {
      icon: Target,
      title: 'To\'rtta rasmiy mezon',
      desc: 'Task Achievement, Coherence & Cohesion, Lexical Resource va Grammatical Range alohida baholanadi. Xatolar matn ichida belgilanadi — bosilsa tuzatilgan variant va sababi chiqadi.',
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
          <span>IELTS Writing · AI baholash</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight md:leading-none tracking-tight mb-6">
          Writing javobingizni <br className="hidden md:inline" />
          <span className="text-[#FF3131]">AI baholab</span> bersin
        </h1>

        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed [text-wrap:pretty]">
          Task 1 va Task 2 javoblarini imtihon vaqti bilan yozing. Bir necha
          soniyada to'rtta rasmiy mezon bo'yicha band score, har bir mezon uchun
          izoh va matn ichida belgilangan xatolarni oling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[#FF3131] text-white hover:bg-[#E82C2C] transition-all shadow-lg shadow-[#FF3131]/25 hover:shadow-xl hover:shadow-[#FF3131]/35 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{user ? "Dashboard-ga O'tish" : "Yozishni boshlash"}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 mt-6 sm:mt-8 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Bepul ro'yxatdan o'tish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Google bilan 1-click login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Baho o'zbek tilida</span>
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

      {/* Baholash qanday ishlaydi */}
      <section className="pb-4 px-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-[24px] p-8 md:p-10 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
            Uch qadamda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '1', t: 'Mavzuni tanlang', d: 'Task 1 uchun grafik, Task 2 uchun insho mavzusi. Taymer imtihondagidek ishlaydi.' },
              { n: '2', t: 'Javobingizni yozing', d: 'Matn avtomatik saqlanadi — sahifa yopilib qolsa ham yo\'qolmaydi.' },
              { n: '3', t: 'Tahlilni oling', d: 'Band score, har bir mezon bo\'yicha izoh va yarim ball ko\'tarish uchun aniq maslahat.' },
            ].map((step) => (
              <div key={step.n} className="flex gap-4">
                <div className="w-9 h-9 shrink-0 rounded-full bg-[#FFF0F0] text-[#FF3131] font-extrabold text-sm flex items-center justify-center">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{step.t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Banner Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#FF3131] to-[#FF6B6B] rounded-[24px] p-10 md:p-14 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-[#FF3131]/20">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold mb-3">Birinchi javobingizni bugun yozing</h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              Bepul akkaunt yarating va Task 1 javobingizni yozib ko'ring — band
              score va batafsil tahlil bir necha soniyada tayyor bo'ladi.
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
