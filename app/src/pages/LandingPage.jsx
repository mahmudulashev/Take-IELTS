import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Headphones, BarChart3, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import {
  useSmoothScroll,
  SplitReveal,
  Reveal,
  RevealGroup,
  Parallax,
  PinnedScene,
  CountUp
} from '../components/motion'

export default function LandingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Inertial scroll — faqat shu sahifada. Boshqa sahifaga
  // o'tilganda avtomatik o'chadi.
  useSmoothScroll(true)

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
    <div className="min-h-screen bg-[#F7F8FC] overflow-x-hidden">
      <Navbar />

      {/* ============================================================
          HERO — sarlavha so'z-ba-so'z ko'tariladi, orqa fon parallaks
          ============================================================ */}
      <section className="relative pt-36 pb-24 px-6 max-w-6xl mx-auto text-center">

        {/* Dekorativ fon qatlamlari — scroll bilan turli tezlikda siljiydi */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Parallax speed={0.35} className="absolute -top-24 -left-24">
            <div className="w-[420px] h-[420px] rounded-full bg-[#FF3131]/[0.07] blur-3xl" />
          </Parallax>
          <Parallax speed={-0.25} className="absolute -top-10 -right-32">
            <div className="w-[380px] h-[380px] rounded-full bg-blue-500/[0.06] blur-3xl" />
          </Parallax>
        </div>

        <Reveal y={16} duration={0.7} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F0] text-[#FF3131] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Computer-Delivered IELTS Simulation</span>
        </Reveal>

        <SplitReveal
          as="h1"
          text="IELTS Imtihoniga Haqiqiy Formatda Tayyorlaning"
          className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight mb-6 max-w-4xl mx-auto"
          delay={0.1}
        />

        <Reveal y={24} delay={0.35} className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed [text-wrap:pretty]">
          Google orqali bir zumda kirib, Reading va Listening mock testlarini topshiring,
          band score va natijalaringizni shaxsiy profildan kuzatib boring.
        </Reveal>

        <Reveal y={20} delay={0.5} className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to={user ? '/dashboard' : '/auth'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[#FF3131] text-white hover:bg-[#E82C2C] transition-ui press shadow-lg shadow-[#FF3131]/25 hover:shadow-xl hover:shadow-[#FF3131]/35 hover:-translate-y-0.5"
          >
            <span>{user ? "Dashboard-ga O'tish" : 'Testni Boshlash'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Reveal>

        <Reveal y={16} delay={0.62} className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 mt-6 sm:mt-8 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Bepul ro'yxatdan o'tish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Google bilan 1-click login</span>
          </div>
        </Reveal>
      </section>

      {/* ============================================================
          PINNED SAHNA — ekranda yopishib turadi, scroll bilan ochiladi
          ============================================================ */}
      <PinnedScene height="300vh" className="relative">
        {(p) => {
          // p: 0 -> 1 (scroll progressi)
          const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
          const seg = (from, to) => clamp((p - from) / (to - from))

          const titleIn = seg(0.0, 0.18)
          const cardScale = 0.82 + seg(0.1, 0.62) * 0.18
          const cardOpacity = seg(0.08, 0.3)
          const statsIn = seg(0.55, 0.8)

          return (
            <div className="w-full max-w-5xl mx-auto px-6 text-center">
              <div
                style={{
                  opacity: titleIn,
                  transform: `translate3d(0, ${(1 - titleIn) * 30}px, 0)`
                }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3131] mb-4">
                  Haqiqiy imtihon muhiti
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-10">
                  Xuddi imtihon markazidagidek
                </h2>
              </div>

              <div
                className="relative mx-auto rounded-[28px] border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 overflow-hidden"
                style={{
                  maxWidth: '860px',
                  opacity: cardOpacity,
                  transform: `scale(${cardScale}) translate3d(0, ${(1 - cardOpacity) * 40}px, 0)`,
                  willChange: 'transform, opacity'
                }}
              >
                {/* Soxta brauzer paneli */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-[11px] font-semibold text-gray-400">
                    Reading Practice 1 — Part 1 of 3
                  </span>
                  <span className="ml-auto text-[11px] font-bold text-[#FF3131] font-timer">
                    59:41
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 text-left">
                  <div className="p-6 md:p-7 border-r border-gray-100">
                    <div className="h-2.5 w-1/3 rounded bg-gray-200 mb-4" />
                    {[95, 88, 92, 76, 90, 84, 70].map((w, i) => (
                      <div
                        key={i}
                        className="h-2 rounded bg-gray-100 mb-2.5"
                        style={{ width: w + '%' }}
                      />
                    ))}
                  </div>
                  <div className="p-6 md:p-7 space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div key={n}>
                        <div className="h-2 w-2/3 rounded bg-gray-200 mb-2.5" />
                        <div className="flex gap-2">
                          <span className="h-7 flex-1 rounded-lg border border-gray-200 bg-gray-50" />
                          <span
                            className="h-7 w-9 rounded-lg"
                            style={{
                              background: n === 1 ? '#FF3131' : '#F1F2F6'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="grid grid-cols-3 gap-4 md:gap-10 max-w-2xl mx-auto mt-10"
                style={{
                  opacity: statsIn,
                  transform: `translate3d(0, ${(1 - statsIn) * 24}px, 0)`
                }}
              >
                {[
                  { v: 9, d: 0, s: '.0', label: 'Maksimal band' },
                  { v: 40, d: 0, s: '', label: 'Savol / test' },
                  { v: 60, d: 0, s: ' daq', label: 'Reading vaqti' }
                ].map((st, i) => (
                  <div key={i}>
                    <p className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                      <CountUp to={st.v} decimals={st.d} suffix={st.s} />
                    </p>
                    <p className="text-[11px] md:text-xs font-semibold text-gray-500 mt-1">
                      {st.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        }}
      </PinnedScene>

      {/* ============================================================
          IMKONIYATLAR — ketma-ket ochiladi
          ============================================================ */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Reveal y={30} className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Nimalar bor
          </h2>
        </Reveal>

        <RevealGroup stagger={0.14} y={50} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-ui hover:-translate-y-1.5"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </RevealGroup>
      </section>

      {/* ============================================================
          CTA banner — parallaks bilan
          ============================================================ */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <Reveal y={50} scale={0.96}>
          <div className="relative bg-gradient-to-r from-[#FF3131] to-[#FF6B6B] rounded-[28px] p-10 md:p-16 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#FF3131]/25 overflow-hidden">

            <div className="pointer-events-none absolute inset-0 -z-0 opacity-30">
              <Parallax speed={0.18} className="absolute -right-16 -top-20">
                <div className="w-72 h-72 rounded-full bg-white/20 blur-2xl" />
              </Parallax>
            </div>

            <div className="max-w-xl relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
                Orzudagi Band Score ga Erishing!
              </h2>
              <p className="text-white/90 text-sm md:text-base leading-relaxed">
                Vaqtni boy bermang, hoziroq bepul akkount yarating va haqiqiy imtihon
                muhitini o'zingizda sinab ko'ring.
              </p>
            </div>

            <Link
              to={user ? '/dashboard' : '/auth'}
              className="relative z-10 px-8 py-4 rounded-full text-base font-bold bg-white text-[#FF3131] hover:bg-gray-50 transition-ui press shadow-lg hover:scale-105 whitespace-nowrap"
            >
              {user ? 'Dashboard →' : "Ro'yxatdan o'tish →"}
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="py-8 border-t border-gray-200/60 text-center text-xs text-gray-400">
        <p>© 2026 Take IELTS. All rights reserved.</p>
      </footer>
    </div>
  )
}
