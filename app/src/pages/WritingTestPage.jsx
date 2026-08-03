import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getPromptById, WRITING_PACKS } from '../data/writing-prompts'
import {
  countWords, evaluateEssay, saveDraft, readDraft, clearDraft,
} from '../lib/writing'
import WritingResult from '../components/writing/WritingResult'
import {
  PenLine, Clock, AlertTriangle, Sparkles, RefreshCw, Info,
} from 'lucide-react'

const TOTAL_SECONDS = 40 * 60   // Task 2 uchun rasmiy vaqt
const MIN_WORDS = 250           // rasmiy minimum

function formatTime(sec) {
  const m = Math.floor(Math.max(0, sec) / 60)
  const s = Math.max(0, sec) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WritingTestPage() {
  const { user, sessionChecked, signOut } = useAuth()
  const navigate = useNavigate()

  // Mavzu URL'dan keladi: /test/writing/writing-3
  const { packId } = useParams()
  const prompt = getPromptById(packId)
  const [essay, setEssay] = useState('')
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [draftOffer, setDraftOffer] = useState(null)

  const essayRef = useRef('')
  const timerRef = useRef(null)
  essayRef.current = essay

  const wordCount = countWords(essay)

  // ----------------------------------------------------------------
  // Kirish nazorati
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!sessionChecked) return
    if (!user) navigate('/auth')
  }, [user, sessionChecked, navigate])

  // ----------------------------------------------------------------
  // Tugallanmagan qoralama
  // ----------------------------------------------------------------
  useEffect(() => {
    const d = readDraft()
    // Faqat SHU to'plamning qoralamasi taklif qilinsin — boshqa
    // mavzuning matnini bu yerga tiklash mantiqsiz bo'lardi.
    if (d?.essay && d.promptId === packId) setDraftOffer(d)
    else setDraftOffer(null)
  }, [packId])

  const restoreDraft = () => {
    if (!draftOffer) return
    setEssay(draftOffer.essay)
    setStarted(true)
    setDraftOffer(null)
  }

  // ----------------------------------------------------------------
  // Taymer
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!started || result) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [started, result])

  // ----------------------------------------------------------------
  // Avtosaqlash — har 8 soniyada va sahifa yopilishidan oldin
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!started || result) return
    const id = setInterval(() => {
      if (essayRef.current.trim()) saveDraft({ promptId: prompt.id, essay: essayRef.current })
    }, 8000)
    const onLeave = () => {
      if (essayRef.current.trim()) saveDraft({ promptId: prompt.id, essay: essayRef.current })
    }
    window.addEventListener('pagehide', onLeave)
    document.addEventListener('visibilitychange', onLeave)
    return () => {
      clearInterval(id)
      window.removeEventListener('pagehide', onLeave)
      document.removeEventListener('visibilitychange', onLeave)
    }
  }, [started, result, prompt.id])

  // Tasodifan yopishdan ogohlantirish
  useEffect(() => {
    if (!started || result) return
    const handler = (e) => {
      if (!essayRef.current.trim()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [started, result])

  // ----------------------------------------------------------------
  // Baholash
  // ----------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (evaluating) return
    setError(null)

    if (wordCount < 50) {
      setError(`Insho juda qisqa (${wordCount} so'z). Baholash uchun kamida 50 so'z kerak.`)
      return
    }

    setEvaluating(true)
    clearInterval(timerRef.current)

    const res = await evaluateEssay({
      promptId: prompt.id,
      promptText: prompt.text,
      essay,
      timeSpent: TOTAL_SECONDS - timeLeft,
    })

    setEvaluating(false)

    if (!res.ok) {
      setError(res.error)
      return
    }

    clearDraft()
    setResult(res.data)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [essay, wordCount, prompt, timeLeft, evaluating])

  // Vaqt tugasa avtomatik yuborish
  useEffect(() => {
    if (started && timeLeft === 0 && !result && !evaluating && wordCount >= 50) {
      handleSubmit()
    }
  }, [timeLeft, started, result, evaluating, wordCount, handleSubmit])

  const startNew = () => {
    clearDraft()
    setEssay('')
    setResult(null)
    setError(null)
    setTimeLeft(TOTAL_SECONDS)
    setStarted(false)
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#FF3131] rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return null
  if (!prompt) return <Navigate to="/writing-packs" replace />

  const timeDanger = timeLeft <= 300 && timeLeft > 0

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col lg:flex-row">
      <Sidebar user={user} onSignOut={signOut} />

      <main className="flex-1 min-w-0 w-full lg:ml-[260px] min-h-screen p-4 sm:p-6 md:p-10 pb-24 lg:pb-10">

        {/* Sarlavha — natija chiqqanda WritingResult o'zinikini ko'rsatadi */}
        {!result && (
        <div className="bg-white rounded-[24px] p-5 sm:p-6 md:p-8 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
              <PenLine className="w-3.5 h-3.5" />
              <span>Writing Task 2</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
              Insho yozing, AI baholab beradi
            </h1>
            <p className="text-xs text-gray-500 mt-1.5">
              40 daqiqa · kamida {MIN_WORDS} so'z · to'rtta rasmiy mezon bo'yicha tahlil
            </p>
          </div>

          {started && !result && (
            <div className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold font-timer text-lg shrink-0 ${
              timeDanger ? 'bg-red-50 text-[#FF3131]' : 'bg-gray-50 text-gray-900'
            }`}>
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
        )}

        {/* Qoralama taklifi */}
        {draftOffer && !started && !result && (
          <div className="bg-white rounded-[20px] p-5 border border-[#FF3131]/20 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <Info className="w-5 h-5 text-[#FF3131] shrink-0" />
            <p className="flex-1 text-xs text-gray-600 leading-relaxed">
              Tugallanmagan insho topildi ({countWords(draftOffer.essay)} so'z).
              Davom ettirasizmi?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={restoreDraft}
                className="px-4 py-2.5 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-xs transition-colors">
                Davom ettirish
              </button>
              <button onClick={() => { clearDraft(); setDraftOffer(null) }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors">
                Yangidan
              </button>
            </div>
          </div>
        )}

        {/* ---------------- NATIJA ---------------- */}
        {result ? (
          <WritingResult result={result} prompt={prompt} onNewEssay={startNew} />
        ) : (
          /* ---------------- YOZISH ---------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <div className="lg:col-span-5">
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm lg:sticky lg:top-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {prompt.type}
                  </span>
                  <span className="text-[11px] font-bold text-gray-400">{prompt.topic}</span>
                </div>

                <p className="text-sm text-gray-800 leading-relaxed font-medium mb-5">{prompt.text}</p>

                <div className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 rounded-xl p-3.5 space-y-1">
                  <p>· Kamida {MIN_WORDS} so'z yozing</p>
                  <p>· Fikringizni aniq bildiring va misollar bilan asoslang</p>
                  <p>· Kirish, 2–3 asosiy paragraf va xulosa tuzilmasiga amal qiling</p>
                </div>

                {!started && (
                  <button onClick={() => setStarted(true)}
                    className="w-full mt-5 py-3.5 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-xs transition-colors">
                    Boshlash (40 daqiqa)
                  </button>
                )}
                {!started && (
                  <button onClick={() => navigate('/writing-packs')}
                    className="w-full mt-2.5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors">
                    Boshqa to'plam tanlash
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Sizning inshoyingiz</h3>
                  <span className={`text-xs font-bold ${wordCount >= MIN_WORDS ? 'text-green-600' : 'text-gray-400'}`}>
                    {wordCount} / {MIN_WORDS} so'z
                  </span>
                </div>

                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  onFocus={() => !started && setStarted(true)}
                  disabled={evaluating}
                  placeholder="Inshoyingizni shu yerga yozing…"
                  spellCheck={false}
                  className="w-full h-[420px] p-4 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/10 outline-none text-sm leading-relaxed resize-none font-sans disabled:bg-gray-50"
                />

                {error && (
                  <div className="mt-4 flex items-start gap-2 text-xs text-[#FF3131] bg-[#FFF0F0] rounded-xl p-3.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={evaluating || wordCount < 50}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {evaluating
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Baholanmoqda… (20–30 soniya)</>
                    : <><Sparkles className="w-4 h-4" /> Topshirish va baholash</>}
                </button>

                {wordCount > 0 && wordCount < MIN_WORDS && (
                  <p className="text-[11px] text-gray-400 mt-2.5 text-center leading-relaxed">
                    {MIN_WORDS} so'zdan kam insho Task Response mezoni bo'yicha jazolanadi.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
