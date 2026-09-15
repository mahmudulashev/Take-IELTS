import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { WRITING_PACKS, WRITING_TASK1_PACKS, TASK_CONFIG } from '../data/writing-prompts'
import { PenLine, ArrowRight, CheckCircle2, Sparkles, BarChart3 } from 'lucide-react'

/**
 * Imtihondagi tartib bilan: avval Task 1, keyin Task 2.
 * Vaqt va so'z minimumi TASK_CONFIG'dan olinadi.
 */
const SECTIONS = [
  {
    task: 'task1',
    packs: WRITING_TASK1_PACKS,
    icon: BarChart3,
    title: 'Task 1 — Grafik tasviri',
    description: "Grafik yoki jadvaldagi asosiy ma'lumotni tanlab, solishtirib yozasiz.",
    cta: 'Boshlash',
  },
  {
    task: 'task2',
    packs: WRITING_PACKS,
    icon: PenLine,
    title: 'Task 2 — Insho',
    description: "Berilgan mavzu bo'yicha fikringizni dalillar bilan asoslaysiz.",
    cta: 'Inshoni Boshlash',
  },
]

export default function WritingPacksPage({ task = 'task1' }) {
  const { user, sessionChecked, signOut, results } = useAuth()
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

  const sections = SECTIONS.filter((s) => s.task === task)
  const cfg = TASK_CONFIG[task]

  /** Shu to'plam bo'yicha eng yaxshi natija (Reading sahifasidagi kabi) */
  const getPackResult = (packId) => {
    const matching = results.filter(r => r.test_type === 'writing' && r.test_id === packId)
    if (!matching.length) return null
    return matching.reduce(
      (max, curr) => parseFloat(curr.band_score) > parseFloat(max.band_score) ? curr : max,
      matching[0],
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">

        {/* Page Banner */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
            <PenLine className="w-3.5 h-3.5" />
            <span>{cfg.label}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {task === 'task1' ? 'Writing Task 1 To\'plamlari' : 'Writing Task 2 To\'plamlari'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {cfg.seconds / 60} daqiqa, kamida {cfg.minWords} so'z.
            Javob tugagach AI to'rtta rasmiy mezon bo'yicha baholaydi va xatolarni matn ichida ko'rsatadi.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <section key={section.task}>
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-gray-900">{section.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400 shrink-0">{section.packs.length} ta to'plam</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.packs.map(pack => {
                    const packResult = getPackResult(pack.id)

                    return (
                      <div
                        key={pack.id}
                        className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-1"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center">
                              <Icon className="w-6 h-6" />
                            </div>

                            {packResult ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Band {packResult.band_score}</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                                Yozilmagan
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-gray-900 mb-1.5 group-hover:text-[#FF3131] transition-colors">
                            {pack.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                              {pack.type}
                            </span>
                            <span className="text-[11px] font-bold text-gray-400">{pack.topic}</span>
                          </div>

                          {/* Mavzuning o'zi — foydalanuvchi tanlashdan oldin ko'rsin */}
                          <p className="text-xs text-gray-500 leading-relaxed mb-5 line-clamp-3">
                            {pack.text}
                          </p>

                          <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mb-6">
                            <span>{cfg.minWords}+ so'z</span>
                            <span>•</span>
                            <span>{cfg.seconds / 60} daqiqa</span>
                            <span>•</span>
                            <span>{pack.difficulty}</span>
                          </div>
                        </div>

                        <Link
                          to={`/test/writing/${pack.id}`}
                          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#FF3131] text-white font-bold text-xs hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20"
                        >
                          <span>{packResult ? 'Qayta Yozish' : section.cta}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>

        {/* AI baholash haqida qisqacha */}
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mt-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">Baholash qanday ishlaydi</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Javob to'rt mezon bo'yicha alohida baholanadi: {cfg.criterion}, Coherence &amp; Cohesion,
              Lexical Resource va Grammatical Range.
              {task === 'task1' && " AI grafikdagi aniq raqamlarni ham oladi, shuning uchun noto'g'ri keltirilgan ma'lumotni ko'rsatib bera oladi."}
              {' '}Xatolar matn ichida
              belgilanadi — bosilsa tuzatilgan variant va sababi chiqadi.
              Bu <strong>taxminiy baho</strong>, rasmiy IELTS ekspertining bahosi emas.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
