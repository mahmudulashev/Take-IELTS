import React, { useState, useMemo, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnotatedEssay, { typeMeta, TYPE_META } from './AnnotatedEssay'
import Task1Chart from './Task1Chart'
import { getPromptById, TASK_CONFIG } from '../../data/writing-prompts'
import { useAuth } from '../../context/AuthContext'
import {
  RefreshCw, ArrowLeft, AlertTriangle,
  ChevronRight, X,
} from 'lucide-react'

const CRITERIA = [
  { key: 'task_response',      field: 'band_task',      label: 'Task Response',     ring: 'Task Response',     short: 'Mavzuga javob' },
  { key: 'coherence_cohesion', field: 'band_coherence', label: 'Coherence & Cohesion', ring: 'Coherence',      short: 'Bog\'lanish' },
  { key: 'lexical_resource',   field: 'band_lexical',   label: 'Lexical Resource',  ring: 'Lexical Resource',  short: 'So\'z boyligi' },
  { key: 'grammatical_range',  field: 'band_grammar',   label: 'Grammatical Range', ring: 'Grammatical Range', short: 'Grammatika' },
]

function isToday(iso) {
  const d = iso ? new Date(iso) : new Date()
  return d.toDateString() === new Date().toDateString()
}

function bandLevel(band) {
  const b = Math.floor(band)
  if (b >= 9) return 'mukammal daraja'
  if (b >= 8) return 'juda yaxshi daraja'
  if (b >= 7) return 'yaxshi daraja'
  if (b >= 6) return 'qoniqarli daraja'
  if (b >= 5) return "o'rtacha daraja"
  if (b >= 4) return 'cheklangan daraja'
  return "boshlang'ich daraja"
}

const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

// 8 → "8", 7.5 → "7.5" (halqa ichida)
const shortBand = (b) => (Number.isInteger(b) ? String(b) : b.toFixed(1))

function Delta({ value }) {
  if (value == null) return null
  if (value > 0) return <span className="text-sm font-semibold text-[#1F7A48]">↑ {value.toFixed(1)}</span>
  if (value < 0) return <span className="text-sm font-semibold text-[#C2242A]">↓ {Math.abs(value).toFixed(1)}</span>
  return <span className="text-sm font-semibold text-[#6B7280]">→ 0.0</span>
}

/**
 * Natija sahifasining yuqori qismi: sarlavha qatori, qora ball kartasi,
 * ballar dinamikasi, ustuvor yo'nalish va to'rtta mezon halqasi.
 * Dinamika va o'zgarishlar shu task turidagi oldingi insholardan olinadi.
 */
function ResultHero({ result, task, criteria }) {
  const { results: allResults = [] } = useAuth() || {}
  const gradId = useId().replace(/:/g, '')

  const overall = num(result.band_overall)
  const createdAt = result.created_at

  // Shu task turidagi insholar, xronologik tartibda, joriy natijagacha
  const history = useMemo(() => {
    const cur = createdAt ? new Date(createdAt).getTime() : Date.now()
    const rows = allResults
      .map((r) => r.writing || r)
      .filter((r) => r && r.band_overall != null && r.id !== result.id)
      .filter((r) => (r.task_type === 'task1' ? 'task1' : 'task2') === task)
      .filter((r) => new Date(r.created_at).getTime() < cur)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    return [...rows, result]
  }, [allResults, result, task, createdAt])

  const previous = history.length > 1 ? history[history.length - 2] : null

  const bands = criteria.map((c) => ({ ...c, band: num(result[c.field]) }))
  const scored = bands.filter((c) => c.band != null)
  const weakest = scored.length
    ? scored.reduce((min, c) => (c.band < min.band ? c : min), scored[0])
    : null
  const target = num(result.feedback?.next_band?.target) ?? (overall != null ? Math.min(9, overall + 0.5) : null)

  // Sparkline: oxirgi 6 ta insho
  const spark = history.slice(-6).map((r) => num(r.band_overall)).filter((b) => b != null)
  const sMin = Math.min(...spark)
  const sMax = Math.max(...spark)
  const pts = spark.map((b, i) => {
    const x = spark.length === 1 ? 292 : 8 + (i * 284) / (spark.length - 1)
    const y = sMax === sMin ? 47 : 80 - ((b - sMin) / (sMax - sMin)) * 66
    return [Math.round(x), Math.round(y)]
  })
  const avg = spark.length ? spark.reduce((a, b) => a + b, 0) / spark.length : null
  const last = pts[pts.length - 1]

  const words = result.word_count || 0
  const minWords = TASK_CONFIG[task].minWords
  const wordsOk = words >= minWords

  const gaugeLen = 282.7
  const gaugeDash = overall != null ? (overall / 9) * gaugeLen : 0

  return (
    <div className="flex flex-col gap-4 text-[#14181F] antialiased" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">

        {/* ---------- Qora ball kartasi ---------- */}
        <div className="xl:col-span-2 min-w-0 bg-[#14181F] rounded-[24px] p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row sm:items-stretch gap-8">
          <div
            className="absolute -top-24 -right-16 w-[320px] h-[320px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(245,51,58,.22),rgba(245,51,58,0) 70%)' }}
          />

          {/* Chap: baho matni va so'z hajmi */}
          <div className="relative flex-1 min-w-0 flex flex-col justify-between gap-7">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold tracking-[.1em] uppercase text-[#FF8E7A]">
                {task === 'task1' ? 'Javobingiz baholandi' : 'Inshoyingiz baholandi'}
              </span>
              <span className="text-[26px] sm:text-[32px] font-semibold tracking-[-.02em] text-white leading-[1.1]">
                {overall != null ? <>Band {shortBand(overall)} <span className="text-[#A7ADB6] font-normal">—</span> {bandLevel(overall)}</> : 'Baho mavjud emas'}
              </span>
              {overall != null && (
                <span className="text-[15px] leading-relaxed text-[#A7ADB6] max-w-[460px]">
                  {overall >= 9
                    ? 'Maksimal ball.'
                    : `9 ballgacha ${(9 - overall).toFixed(1)} ball qoldi.`}
                  {weakest && weakest.band < 9 && <> Eng past mezon — <span className="text-white">{weakest.short.toLowerCase()}</span>.</>}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5 max-w-[420px] pt-5 border-t border-[#2A2F38]">
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-semibold text-white leading-none">{words || '—'}</span>
                  <span className="text-sm text-[#A7ADB6]">so'z</span>
                </span>
                <span className={`text-[13px] font-medium ${wordsOk ? 'text-[#6FCF97]' : 'text-[#FF8E7A]'}`}>
                  {wordsOk ? `✓ ${minWords} so'z talabi bajarildi` : `${minWords - words} so'z yetmadi`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2A2F38] overflow-hidden">
                <div
                  className={`h-full rounded-full ${wordsOk ? 'bg-[#6FCF97]' : 'bg-[#F5333A]'}`}
                  style={{ width: `${Math.min(100, (words / minWords) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* O'ng: ball ko'rsatkichi */}
          <div className="relative flex-none self-center flex flex-col items-center gap-1">
            <svg viewBox="0 0 220 124" className="w-[240px] h-[135px] block">
              <path d="M 20 112 A 90 90 0 0 1 200 112" fill="none" stroke="#2A2F38" strokeWidth="16" strokeLinecap="round" />
              {overall != null && (
                <path d="M 20 112 A 90 90 0 0 1 200 112" fill="none" stroke="#F5333A" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${gaugeDash.toFixed(1)} ${gaugeLen}`} />
              )}
              <text x="110" y="104" textAnchor="middle" fill="#ffffff" fontFamily="Outfit, system-ui, sans-serif" fontSize="56" fontWeight="600" letterSpacing="-2">
                {overall != null ? overall.toFixed(1) : '—'}
              </text>
            </svg>
            <div className="flex justify-between w-[208px] text-[12px] text-[#6B7280] -mt-1">
              <span>0</span><span className="tracking-[.04em] text-[#A7ADB6]">9 ballik shkala</span><span>9</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex flex-col gap-4">
          {/* ---------- Ballar dinamikasi ---------- */}
          <div className="flex-1 bg-white border border-[#E9E9EC] rounded-[24px] px-6 py-[22px] flex flex-col gap-3.5">
            <div className="flex items-baseline justify-between gap-2.5">
              <span className="text-base font-semibold">Ballar dinamikasi</span>
              <span className="text-[13px] text-[#6B7280]">{spark.length} insho</span>
            </div>
            <svg viewBox="0 0 300 96" preserveAspectRatio="none" className="w-full h-24 block">
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5333A" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#F5333A" stopOpacity="0" />
                </linearGradient>
              </defs>
              {pts.length > 1 && (
                <>
                  <path d={`M${pts.map((p) => p.join(',')).join(' L')} L${last[0]},96 L${pts[0][0]},96 Z`} fill={`url(#${gradId})`} />
                  <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#F5333A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
              {last && <circle cx={last[0]} cy={last[1]} r="5" fill="#F5333A" />}
            </svg>
            <div className="flex justify-between text-[13px] text-[#6B7280]">
              <span>O'rtacha {avg != null ? avg.toFixed(1) : '—'}</span>
              <span className="text-[#14181F] font-semibold">
                {isToday(createdAt) ? 'Bugun' : 'Shu insho'} {overall != null ? overall.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* ---------- Ustuvor yo'nalish ---------- */}
          {weakest && (
            <div className="bg-[#FFF1EF] rounded-[24px] px-6 py-[22px] flex flex-col gap-2">
              <span className="text-xs font-semibold tracking-[.09em] uppercase text-[#C2242A]">Ustuvor yo'nalish</span>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xl font-semibold">{weakest.short}</span>
                <span className="text-[28px] font-semibold text-[#C2242A]">{weakest.band.toFixed(1)}</span>
              </div>
              <p className="text-sm leading-normal text-[#4A5058]">
                {target != null && overall != null && target > overall
                  ? `Shu mezonni kuchaytirsangiz, umumiy ball ${target.toFixed(1)} ga chiqadi.`
                  : 'Shu mezonni kuchaytirish umumiy ballni barqaror ushlab turadi.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Mezon halqalari ---------- */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {bands.map((c) => {
          const circ = 163.4
          const dash = c.band != null ? (c.band / 9) * circ : 0
          const prev = previous ? num(previous[c.field]) : null
          return (
            <div key={c.key} className="bg-white border border-[#E9E9EC] rounded-[22px] px-6 py-6 flex items-center gap-5">
              <svg viewBox="0 0 64 64" className="w-20 h-20 flex-none">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#F1F1F2" strokeWidth="7" />
                {c.band != null && (
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#F5333A" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${circ}`} transform="rotate(-90 32 32)" />
                )}
                <text x="32" y="38" textAnchor="middle" fill="#14181F" fontFamily="Outfit, system-ui, sans-serif" fontSize={c.band != null && !Number.isInteger(c.band) ? 16 : 18} fontWeight="600">
                  {c.band != null ? shortBand(c.band) : '—'}
                </text>
              </svg>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[17px] font-semibold leading-tight">{c.ring}</span>
                <span className="text-sm text-[#6B7280]">{c.short}</span>
                <Delta value={prev != null && c.band != null ? c.band - prev : null} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const LABEL = 'text-xs font-semibold tracking-[.09em] uppercase'
const CARD = 'bg-white border border-[#E9E9EC] rounded-[24px]'

/**
 * Task 1: AI javobdagi har bir raqam va solishtiruvchi da'voni grafik bilan
 * tekshiradi. Nimalar tekshirilgani ko'rinib tursin — ball nimaga
 * asoslanganini foydalanuvchi o'zi ko'ra olsin.
 */
function DataChecks({ checks }) {
  const wrong = checks.filter((c) => c.verdict === 'inaccurate')
  const approx = checks.filter((c) => c.verdict === 'approximation')

  return (
    <div className={`${CARD} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="text-[22px] font-semibold tracking-[-.01em]">Ma'lumot aniqligi</span>
        <span className="text-sm text-[#6B7280]">
          {checks.length} ta da'vo tekshirildi · {wrong.length} ta noto'g'ri · {approx.length} ta taxminiy
        </span>
      </div>

      {wrong.length === 0 ? (
        <p className="text-[15px] leading-normal text-[#1F7A48] bg-[#EEF7F1] rounded-2xl px-[18px] py-4">
          Keltirilgan raqamlar va solishtirishlar grafikka mos.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
          {wrong.map((c, i) => (
            <div key={i} className="bg-[#FFF1EF] rounded-2xl px-[18px] py-4 flex flex-col gap-1.5">
              <span className={`${LABEL} text-[#C2242A]`}>
                {c.severity === 'major' ? 'Asosiy xususiyatni buzadi' : "Noto'g'ri raqam"}
              </span>
              <p className="text-[15px] leading-normal text-[#3F4650] italic">"{c.quote}"</p>
              {c.correct_value && (
                <p className="text-[15px] leading-normal text-[#3F4650]">
                  <span className="font-semibold text-[#C2242A]">To'g'risi: </span>{c.correct_value}
                </p>
              )}
              {c.note && <p className="text-sm leading-normal text-[#6B7280]">{c.note}</p>}
            </div>
          ))}
        </div>
      )}

      {approx.length > 0 && (
        <p className="text-sm text-[#6B7280] leading-relaxed">
          Taxminiy deb qabul qilindi, ball tushirilmadi: {approx.map((c) => `"${c.quote}"`).join(', ')}
        </p>
      )}
    </div>
  )
}

export default function WritingResult({ result, prompt, onNewEssay }) {
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(null)
  const [filter, setFilter] = useState(null)

  const fb = result?.feedback || {}
  const annotations = fb.annotations || []
  const active = activeIdx != null ? annotations[activeIdx] : null

  // Xato turlari bo'yicha sanoq — filtr tugmalari uchun
  const counts = useMemo(() => {
    const c = {}
    annotations.forEach((a) => { c[a.type] = (c[a.type] || 0) + 1 })
    return c
  }, [annotations])

  const overall = num(result.band_overall)

  // Birinchi mezon Task 1'da boshqa nomlanadi, lekin baza ustuni
  // (`band_task`) va JSON kaliti (`task_response`) ikkalasida bir xil.
  const task = result?.task_type === 'task1' ? 'task1' : 'task2'
  const criteria = CRITERIA.map((c) => (c.key === 'task_response'
    ? { ...c, label: TASK_CONFIG[task].criterion, ring: TASK_CONFIG[task].criterion, short: task === 'task1' ? 'Topshiriqni bajarish' : c.short }
    : c))

  // Kuchli / zaif mezon — faqat ballar farq qilganda ajratib ko'rsatiladi
  const scored = criteria.map((c) => ({ ...c, band: num(result[c.field]) })).filter((c) => c.band != null)
  const minBand = scored.length ? Math.min(...scored.map((c) => c.band)) : null
  const maxBand = scored.length ? Math.max(...scored.map((c) => c.band)) : null
  const uneven = minBand != null && minBand !== maxBand
  const strongest = uneven ? scored.find((c) => c.band === maxBand) : null
  const weakest = uneven ? scored.find((c) => c.band === minBand) : null
  const target = num(fb.next_band?.target) ?? (overall != null ? Math.min(9, overall + 0.5) : null)

  // Task 1 izohlari grafikdagi raqamlarga ishora qiladi — grafik ko'rinib tursin
  const chart = task === 'task1'
    ? (prompt?.chart ?? getPromptById(result?.prompt_id)?.chart ?? null)
    : null

  const noun = task === 'task1' ? 'Javob' : 'Insho'

  return (
    <div className="flex flex-col gap-4 text-[#14181F] antialiased" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* ---------- Yuqori qism: sarlavha, ball, dinamika, mezon halqalari ---------- */}
      <ResultHero
        result={result}
        task={task}
        criteria={criteria}
      />

      {/* ---------- Mezonlar bo'yicha izoh ---------- */}
      <div className={`${CARD} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-6`}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-[22px] font-semibold tracking-[-.01em]">Mezonlar bo'yicha izoh</span>
          <span className="text-sm text-[#6B7280]">Har bir mezon uchun sitata va +0.5 ga yo'l</span>
        </div>

        {criteria.map((c) => {
          const band = num(result[c.field])
          const detail = fb.criteria_feedback?.[c.key]
          const low = uneven && band === minBand

          return (
            <div key={c.key} className="flex flex-col gap-3.5 pt-[22px] border-t border-[#EDEDF0]">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="text-lg font-semibold">{c.label}</span>
                <span className="text-sm text-[#6B7280]">{c.short}</span>
                <span className={`ml-auto text-[15px] font-semibold rounded-[10px] px-3 py-1.5 ${
                  low ? 'bg-[#FFE9E9] text-[#C2242A]' : 'bg-[#F4F4F5]'
                }`}>
                  {band != null ? band.toFixed(1) : '—'}
                </span>
              </div>

              {detail && typeof detail === 'object' && (
                <>
                  {detail.why && <p className="text-[15px] leading-relaxed text-[#3F4650]">{detail.why}</p>}
                  {(detail.evidence || detail.to_improve) && (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
                      {detail.evidence && (
                        <div className="bg-[#F7F7F8] rounded-2xl px-[18px] py-4 flex flex-col gap-1.5">
                          <span className={`${LABEL} text-[#6B7280]`}>{noun}dan</span>
                          <p className="text-[15px] leading-normal text-[#3F4650] italic">"{detail.evidence}"</p>
                        </div>
                      )}
                      {detail.to_improve && (
                        <div className="bg-[#FFF1EF] rounded-2xl px-[18px] py-4 flex flex-col gap-1.5">
                          <span className={`${LABEL} text-[#C2242A]`}>+0.5 uchun</span>
                          <p className="text-[15px] leading-normal text-[#3F4650]">{detail.to_improve}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {typeof detail === 'string' && (
                <p className="text-[15px] leading-relaxed text-[#3F4650]">{detail}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* ---------- Ma'lumot aniqligi: faqat Task 1 ---------- */}
      {task === 'task1' && Array.isArray(fb.data_checks) && fb.data_checks.length > 0 && (
        <DataChecks checks={fb.data_checks} />
      )}

      {/* ---------- Umumiy xulosa ---------- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className={`${CARD} ${fb.summary ? 'xl:col-span-2' : 'hidden'} min-w-0 px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-2.5`}>
          <span className={`${LABEL} text-[#C2242A]`}>Umumiy xulosa</span>
          <p className="text-[17px] sm:text-[19px] leading-[1.55] text-[#22262E]">{fb.summary}</p>
        </div>
        <div className={`${CARD} ${fb.summary ? '' : 'xl:col-span-3'} min-w-0 px-[26px] py-6 flex flex-col gap-3.5`}>
          <div className="flex justify-between gap-2.5 text-[15px] text-[#6B7280] pb-3 border-b border-[#EDEDF0]">
            <span>Kuchli tomon</span>
            <span className="text-[#14181F] font-semibold text-right">{strongest ? strongest.short : '—'}</span>
          </div>
          <div className="flex justify-between gap-2.5 text-[15px] text-[#6B7280] pb-3 border-b border-[#EDEDF0]">
            <span>Zaif tomon</span>
            <span className="text-[#14181F] font-semibold text-right">{weakest ? weakest.short : '—'}</span>
          </div>
          <div className="flex justify-between gap-2.5 text-[15px] text-[#6B7280]">
            <span>Keyingi maqsad</span>
            <span className="text-[#C2242A] font-semibold">
              {target != null && overall != null && target > overall ? target.toFixed(1) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- ASOSIY QISM: belgilangan insho ---------- */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[22px] font-semibold tracking-[-.01em]">
              {task === 'task1' ? 'Javobingiz' : 'Inshoyingiz'}, xatolar belgilangan holda
            </span>
            <span className="text-[15px] text-[#6B7280]">Rangli joyni bosing — tuzatilgan variant va sababi chiqadi.</span>
          </div>

          {annotations.length > 0 && (
            <div className="flex gap-2.5 flex-wrap">
              <button
                onClick={() => { setFilter(null); setActiveIdx(null) }}
                className={`text-sm rounded-xl px-4 py-2.5 transition-colors ${
                  filter === null
                    ? 'font-semibold bg-[#14181F] text-white border border-[#14181F]'
                    : 'font-medium bg-white text-[#3F4650] border border-[#E6E6E9] hover:bg-[#FAFAFA] hover:border-[#D6D6DA]'
                }`}
              >
                Hammasi ({annotations.length})
              </button>

              {Object.entries(counts).map(([type, n]) => {
                const meta = typeMeta(type)
                const on = filter === type
                return (
                  <button
                    key={type}
                    onClick={() => { setFilter(on ? null : type); setActiveIdx(null) }}
                    className={`inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 transition-colors ${
                      on
                        ? 'font-semibold bg-[#14181F] text-white border border-[#14181F]'
                        : 'font-medium bg-white text-[#3F4650] border border-[#E6E6E9] hover:bg-[#FAFAFA] hover:border-[#D6D6DA]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${on ? 'bg-white' : meta.dot}`} />
                    {meta.label} ({n})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-[#EDEDF0]">
          <div className="lg:col-span-7 px-5 py-6 sm:px-[30px] sm:py-7 lg:border-r border-[#EDEDF0]">
            <AnnotatedEssay
              essay={result.essay}
              annotations={annotations}
              activeIdx={activeIdx}
              onSelect={setActiveIdx}
              filter={filter}
            />
          </div>

          {/* Tanlangan xato paneli */}
          <div className="lg:col-span-5 px-5 py-6 sm:px-[30px] sm:py-7 bg-[#F7F7F8]">
            {active ? (
              <div className="lg:sticky lg:top-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium bg-white text-[#3F4650] border border-[#E6E6E9] rounded-xl px-3 py-1.5">
                    <span className={`w-2 h-2 rounded-full ${typeMeta(active.type).dot}`} />
                    {typeMeta(active.type).label}
                  </span>
                  <button onClick={() => setActiveIdx(null)} className="text-[#6B7280] hover:text-[#14181F] shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className={`${LABEL} text-[#6B7280] mb-1.5`}>Sizda</p>
                <p className="text-[15px] text-[#C2242A] line-through leading-relaxed mb-4">{active.quote}</p>

                <p className={`${LABEL} text-[#6B7280] mb-1.5`}>Tuzatilgan</p>
                <p className="text-[15px] text-[#1F7A48] font-semibold leading-relaxed mb-4">{active.fix}</p>

                {active.note && (
                  <>
                    <p className={`${LABEL} text-[#6B7280] mb-1.5`}>Nega</p>
                    <p className="text-sm text-[#3F4650] leading-relaxed">{active.note}</p>
                  </>
                )}

                <div className="flex items-center gap-2.5 mt-6">
                  <button
                    onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                    disabled={activeIdx === 0}
                    className="flex-1 py-2.5 rounded-xl border border-[#E6E6E9] bg-white text-[#3F4650] font-medium text-sm hover:bg-[#FAFAFA] disabled:opacity-40 transition-colors"
                  >
                    Oldingi
                  </button>
                  <button
                    onClick={() => setActiveIdx(Math.min(annotations.length - 1, activeIdx + 1))}
                    disabled={activeIdx >= annotations.length - 1}
                    className="flex-1 py-2.5 rounded-xl bg-[#14181F] text-white font-semibold text-sm hover:bg-[#2A2F38] disabled:opacity-40 transition-colors"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            ) : (
              <div className="lg:sticky lg:top-6 text-center py-8">
                <div className="w-11 h-11 rounded-full bg-white border border-[#E6E6E9] flex items-center justify-center mx-auto mb-3">
                  <ChevronRight className="w-5 h-5 text-[#A7ADB6]" />
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed max-w-[240px] mx-auto">
                  {annotations.length > 0
                    ? 'Matndagi rangli joylardan birini bosing — tuzatish shu yerda chiqadi.'
                    : 'Bu inshoda belgilangan xato topilmadi.'}
                </p>
                {annotations.length > 0 && (
                  <button
                    onClick={() => setActiveIdx(0)}
                    className="mt-4 px-[18px] py-2.5 rounded-xl bg-[#14181F] text-white font-semibold text-sm hover:bg-[#2A2F38] transition-colors"
                  >
                    Birinchisidan boshlash
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Keyingi bandga chiqish rejasi + kuchli tomonlar ---------- */}
      {(fb.next_band?.actions?.length > 0 || fb.strengths?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {fb.next_band?.actions?.length > 0 && (
            <div className={`${CARD} ${fb.strengths?.length ? '' : 'lg:col-span-2'} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5`}>
              <div className="flex flex-col gap-1">
                <span className={`${LABEL} text-[#C2242A]`}>Keyingi qadam</span>
                <span className="text-[22px] font-semibold tracking-[-.01em]">
                  Band {fb.next_band.target} ga chiqish uchun
                </span>
              </div>
              <ol className="flex flex-col gap-3">
                {fb.next_band.actions.map((a, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#3F4650] leading-normal">
                    <span className="w-7 h-7 rounded-[10px] bg-[#F4F4F5] text-[#14181F] text-sm font-semibold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {fb.strengths?.length > 0 && (
            <div className={`${CARD} ${fb.next_band?.actions?.length ? '' : 'lg:col-span-2'} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5`}>
              <div className="flex flex-col gap-1">
                <span className={`${LABEL} text-[#1F7A48]`}>Kuchli tomonlar</span>
                <span className="text-[22px] font-semibold tracking-[-.01em]">Nimani saqlab qolish kerak</span>
              </div>
              <ul className="flex flex-col gap-3">
                {fb.strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-[#3F4650] leading-normal">
                    <span className="w-2 h-2 rounded-full bg-[#1F7A48] shrink-0 mt-2" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ---------- Mavzu + ogohlantirish ---------- */}
      <div className={`${CARD} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-4`}>
        <span className={`${LABEL} text-[#6B7280]`}>Mavzu</span>
        <p className="text-[15px] text-[#3F4650] leading-relaxed">{result.prompt_text || prompt?.text}</p>
        {chart && (
          <div className="rounded-2xl border border-[#EDEDF0] p-3 sm:p-4">
            <Task1Chart chart={chart} />
          </div>
        )}

        <div className="flex items-start gap-2 text-[13px] text-[#6B7280] leading-relaxed border-t border-[#EDEDF0] pt-4">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Bu <strong>taxminiy baho</strong> — sun'iy intellekt rasmiy band descriptor'lar
            asosida hisoblaydi, rasmiy IELTS ekspertining bahosi emas. Haqiqiy imtihon
            natijasi farq qilishi mumkin.
          </p>
        </div>
      </div>

      {/* ---------- Amallar ---------- */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button onClick={onNewEssay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[18px] py-2.5 rounded-xl bg-[#14181F] hover:bg-[#2A2F38] text-white font-semibold text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Shu mavzuni qayta yozish
        </button>
        <button onClick={() => navigate(`/writing-${task}`)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[18px] py-2.5 rounded-xl border border-[#E6E6E9] bg-white text-[#3F4650] font-medium text-sm hover:bg-[#FAFAFA] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Boshqa to'plam
        </button>
      </div>
    </div>
  )
}
