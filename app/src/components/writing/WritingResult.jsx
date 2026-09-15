import React, { useState, useMemo, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnotatedEssay, { typeMeta, TYPE_META } from './AnnotatedEssay'
import Task1Chart from './Task1Chart'
import { getPromptById, TASK_CONFIG } from '../../data/writing-prompts'
import { useAuth } from '../../context/AuthContext'
import { formatSeconds } from '../../lib/scoring'
import {
  RefreshCw, ArrowLeft, AlertTriangle, Target,
  ChevronRight, Sparkles, X,
} from 'lucide-react'

const CRITERIA = [
  { key: 'task_response',      field: 'band_task',      label: 'Task Response',     ring: 'Task Response',     short: 'Mavzuga javob' },
  { key: 'coherence_cohesion', field: 'band_coherence', label: 'Coherence & Cohesion', ring: 'Coherence',      short: 'Bog\'lanish' },
  { key: 'lexical_resource',   field: 'band_lexical',   label: 'Lexical Resource',  ring: 'Lexical Resource',  short: 'So\'z boyligi' },
  { key: 'grammatical_range',  field: 'band_grammar',   label: 'Grammatical Range', ring: 'Grammatical Range', short: 'Grammatika' },
]

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

function formatUzDateTime(iso) {
  const d = iso ? new Date(iso) : new Date()
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${hh}:${mm}`
}

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
  if (value > 0) return <span className="text-[13px] font-semibold text-[#1F7A48]">↑ {value.toFixed(1)}</span>
  if (value < 0) return <span className="text-[13px] font-semibold text-[#C2242A]">↓ {Math.abs(value).toFixed(1)}</span>
  return <span className="text-[13px] font-semibold text-[#6B7280]">→ 0.0</span>
}

/**
 * Natija sahifasining yuqori qismi: sarlavha qatori, qora ball kartasi,
 * ballar dinamikasi, ustuvor yo'nalish va to'rtta mezon halqasi.
 * Dinamika va o'zgarishlar shu task turidagi oldingi insholardan olinadi.
 */
function ResultHero({ result, task, criteria, annotationsCount, onNewEssay }) {
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
  const overallDelta = previous && overall != null ? overall - num(previous.band_overall) : null

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

  const gaugeLen = 282.7
  const gaugeDash = overall != null ? (overall / 9) * gaugeLen : 0

  const stat4 = result.unlimited
    ? { value: 'Limitsiz', label: 'kunlik urinish' }
    : typeof result.attemptsToday === 'number' && result.dailyLimit
      ? { value: `${result.attemptsToday}/${result.dailyLimit}`, label: 'bugungi urinish' }
      : { value: result.time_spent > 0 ? formatSeconds(result.time_spent) : '—', label: 'yozish vaqti' }

  const stats = [
    { value: result.word_count ?? '—', label: "so'z" },
    { value: annotationsCount, label: 'belgilangan joy' },
    {
      value: overallDelta == null ? '—' : `${overallDelta > 0 ? '+' : ''}${overallDelta.toFixed(1)}`,
      label: 'oldingi inshoga nisbatan',
    },
    stat4,
  ]

  return (
    <div className="flex flex-col gap-4 text-[#14181F] antialiased" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>

      {/* ---------- Sarlavha qatori ---------- */}
      <div className="flex items-center justify-between gap-4 flex-wrap px-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-[7px] bg-[#FFE9E9] text-[#C2242A] text-xs font-semibold tracking-[.09em] uppercase px-3 py-[7px] rounded-full">
            {TASK_CONFIG[task].label} · Tahlil
          </span>
          <span className="text-sm text-[#6B7280]">{formatUzDateTime(createdAt)} · AI baholash</span>
        </div>
        {onNewEssay && (
          <button
            onClick={onNewEssay}
            className="text-sm font-semibold bg-[#14181F] hover:bg-[#2A2F38] text-white rounded-xl px-[18px] py-2.5 transition-colors"
          >
            Yangi insho yozish
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">

        {/* ---------- Qora ball kartasi ---------- */}
        <div className="xl:col-span-2 min-w-0 bg-[#14181F] rounded-[24px] px-5 py-6 sm:px-8 sm:py-[30px] flex flex-col gap-[26px] relative overflow-hidden">
          <div
            className="absolute -top-20 -right-[60px] w-[260px] h-[260px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(245,51,58,.28),rgba(245,51,58,0) 70%)' }}
          />
          <div className="flex items-start justify-between gap-5 flex-wrap relative">
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold tracking-[.1em] uppercase text-[#FF8E7A]">
                {task === 'task1' ? 'Javobingiz baholandi' : 'Inshoyingiz baholandi'}
              </span>
              <span className="text-2xl sm:text-[30px] font-semibold tracking-[-.02em] text-white leading-[1.15]">
                {overall != null ? `Band ${shortBand(overall)} — ${bandLevel(overall)}` : 'Baho mavjud emas'}
              </span>
              {overall != null && (
                <span className="text-[15px] text-[#A7ADB6]">
                  {overall >= 9
                    ? 'Maksimal ball.'
                    : `9 ballgacha ${(9 - overall).toFixed(1)} ball qoldi.`}
                  {weakest && weakest.band < 9 && ` Eng past mezon — ${weakest.short.toLowerCase()}.`}
                </span>
              )}
            </div>
            <div className="flex-none flex flex-col items-center gap-0.5">
              <svg viewBox="0 0 220 124" className="w-[220px] h-[124px] block">
                <path d="M 20 112 A 90 90 0 0 1 200 112" fill="none" stroke="#2A2F38" strokeWidth="16" strokeLinecap="round" />
                {overall != null && (
                  <path d="M 20 112 A 90 90 0 0 1 200 112" fill="none" stroke="#F5333A" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${gaugeDash.toFixed(1)} ${gaugeLen}`} />
                )}
                <text x="110" y="100" textAnchor="middle" fill="#ffffff" fontFamily="Outfit, system-ui, sans-serif" fontSize="54" fontWeight="600" letterSpacing="-2">
                  {overall != null ? overall.toFixed(1) : '—'}
                </text>
              </svg>
              <span className="text-[13px] text-[#A7ADB6] tracking-[.04em]">9 ballik shkala</span>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-px bg-[#2A2F38] rounded-2xl overflow-hidden relative">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#14181F] px-[18px] py-4 flex flex-col gap-[3px]">
                <span className="text-[22px] font-semibold text-white">{s.value}</span>
                <span className="text-[13px] text-[#A7ADB6]">{s.label}</span>
              </div>
            ))}
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
            <div key={c.key} className="bg-white border border-[#E9E9EC] rounded-[20px] px-[22px] py-5 flex items-center gap-[18px]">
              <svg viewBox="0 0 64 64" className="w-16 h-16 flex-none">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#F1F1F2" strokeWidth="7" />
                {c.band != null && (
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#F5333A" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} ${circ}`} transform="rotate(-90 32 32)" />
                )}
                <text x="32" y="38" textAnchor="middle" fill="#14181F" fontFamily="Outfit, system-ui, sans-serif" fontSize={c.band != null && !Number.isInteger(c.band) ? 16 : 18} fontWeight="600">
                  {c.band != null ? shortBand(c.band) : '—'}
                </text>
              </svg>
              <div className="flex flex-col gap-[3px] min-w-0">
                <span className="text-[15px] font-semibold">{c.ring}</span>
                <span className="text-[13px] text-[#6B7280]">{c.short}</span>
                <Delta value={prev != null && c.band != null ? c.band - prev : null} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Task 1: AI javobdagi har bir raqam va solishtiruvchi da'voni grafik bilan
 * tekshiradi. Nimalar tekshirilgani ko'rinib tursin — ball nimaga
 * asoslanganini foydalanuvchi o'zi ko'ra olsin.
 */
function DataChecks({ checks }) {
  const wrong = checks.filter((c) => c.verdict === 'inaccurate')
  const approx = checks.filter((c) => c.verdict === 'approximation')

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h4 className="text-sm font-bold text-gray-900">Ma'lumot aniqligi</h4>
        <span className="text-xs text-gray-400">
          {checks.length} ta da'vo tekshirildi · {wrong.length} ta noto'g'ri · {approx.length} ta taxminiy
        </span>
      </div>

      {wrong.length === 0 ? (
        <p className="text-xs text-green-700 bg-green-50 rounded-xl p-3">
          Keltirilgan raqamlar va solishtirishlar grafikka mos.
        </p>
      ) : (
        <ul className="space-y-2">
          {wrong.map((c, i) => (
            <li key={i} className="text-xs bg-red-50 rounded-xl p-3 leading-relaxed">
              <p className="text-gray-800 italic">"{c.quote}"</p>
              {c.correct_value && (
                <p className="text-gray-700 mt-1">
                  <span className="font-bold text-[#FF3131]">To'g'risi: </span>{c.correct_value}
                </p>
              )}
              {c.note && <p className="text-gray-500 mt-1">{c.note}</p>}
              {c.severity === 'major' && (
                <p className="text-[11px] font-bold text-[#FF3131] mt-1">Asosiy xususiyatni buzadi</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {approx.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
          Taxminiy deb qabul qilindi, ball tushirilmadi: {approx.map((c) => `"${c.quote}"`).join(', ')}
        </p>
      )}
    </div>
  )
}

function barColor(band) {
  const b = parseFloat(band)
  if (b >= 7) return 'bg-green-500'
  if (b >= 5.5) return 'bg-[#FF3131]'
  return 'bg-amber-500'
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

  const overall = result.band_overall

  // Birinchi mezon Task 1'da boshqa nomlanadi, lekin baza ustuni
  // (`band_task`) va JSON kaliti (`task_response`) ikkalasida bir xil.
  const task = result?.task_type === 'task1' ? 'task1' : 'task2'
  const criteria = CRITERIA.map((c) => (c.key === 'task_response'
    ? { ...c, label: TASK_CONFIG[task].criterion, ring: TASK_CONFIG[task].criterion, short: task === 'task1' ? 'Topshiriqni bajarish' : c.short }
    : c))

  // Task 1 izohlari grafikdagi raqamlarga ishora qiladi — grafik ko'rinib tursin
  const chart = task === 'task1'
    ? (prompt?.chart ?? getPromptById(result?.prompt_id)?.chart ?? null)
    : null

  return (
    <div className="space-y-6">

      {/* ---------- Yuqori qism: sarlavha, ball, dinamika, mezon halqalari ---------- */}
      <ResultHero
        result={result}
        task={task}
        criteria={criteria}
        annotationsCount={annotations.length}
        onNewEssay={onNewEssay}
      />

      {/* ---------- Mezonlar: gorizontal bar, Reports uslubida ---------- */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Mezonlar bo'yicha</h3>

        <div className="space-y-5">
          {criteria.map((c) => {
            const band = result[c.field]
            const detail = fb.criteria_feedback?.[c.key]
            const pct = Math.max(0, Math.min(100, (parseFloat(band) || 0) / 9 * 100))

            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-gray-900">{c.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{c.short}</span>
                  </div>
                  <span className="text-lg font-extrabold text-gray-900 shrink-0">{band ?? '—'}</span>
                </div>

                <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
                  <div className={`h-full rounded-full ${barColor(band)}`} style={{ width: `${pct}%` }} />
                </div>

                {detail && typeof detail === 'object' && (
                  <div className="pl-3 border-l-2 border-gray-100 space-y-1.5">
                    <p className="text-xs text-gray-600 leading-relaxed">{detail.why}</p>
                    {detail.evidence && (
                      <p className="text-xs text-gray-400 italic leading-relaxed">"{detail.evidence}"</p>
                    )}
                    {detail.to_improve && (
                      <p className="text-xs text-gray-800 leading-relaxed">
                        <span className="font-bold text-[#FF3131]">+0.5 uchun: </span>
                        {detail.to_improve}
                      </p>
                    )}
                  </div>
                )}
                {typeof detail === 'string' && (
                  <p className="text-xs text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-100">{detail}</p>
                )}
              </div>
            )
          })}
        </div>

        {fb.summary && (
          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-2xl p-4 mt-6">
            {fb.summary}
          </p>
        )}

        {task === 'task1' && Array.isArray(fb.data_checks) && fb.data_checks.length > 0 && (
          <DataChecks checks={fb.data_checks} />
        )}
      </div>

      {/* ---------- ASOSIY QISM: belgilangan insho ---------- */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-1">{task === 'task1' ? 'Javobingiz' : 'Inshoyingiz'}, xatolar belgilangan holda</h3>
          <p className="text-xs text-gray-500">
            Rangli joyni bosing — tuzatilgan variant va sababi chiqadi.
          </p>

          {annotations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={() => { setFilter(null); setActiveIdx(null) }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  filter === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      on ? 'bg-gray-900 text-white border-gray-900' : `${meta.chip} hover:brightness-95`
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-white' : meta.dot}`} />
                    {meta.label} ({n})
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 md:p-8 lg:border-r border-gray-100">
            <AnnotatedEssay
              essay={result.essay}
              annotations={annotations}
              activeIdx={activeIdx}
              onSelect={setActiveIdx}
              filter={filter}
            />
          </div>

          {/* Tanlangan xato paneli */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-gray-50/60">
            {active ? (
              <div className="lg:sticky lg:top-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeMeta(active.type).chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${typeMeta(active.type).dot}`} />
                    {typeMeta(active.type).label}
                  </span>
                  <button onClick={() => setActiveIdx(null)} className="text-gray-400 hover:text-gray-900 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sizda</p>
                <p className="text-sm text-red-600 line-through leading-relaxed mb-4">{active.quote}</p>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tuzatilgan</p>
                <p className="text-sm text-green-700 font-semibold leading-relaxed mb-4">{active.fix}</p>

                {active.note && (
                  <>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nega</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{active.note}</p>
                  </>
                )}

                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                    disabled={activeIdx === 0}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Oldingi
                  </button>
                  <button
                    onClick={() => setActiveIdx(Math.min(annotations.length - 1, activeIdx + 1))}
                    disabled={activeIdx >= annotations.length - 1}
                    className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    Keyingi
                  </button>
                </div>
              </div>
            ) : (
              <div className="lg:sticky lg:top-6 text-center py-8">
                <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                  {annotations.length > 0
                    ? 'Matndagi rangli joylardan birini bosing — tuzatish shu yerda chiqadi.'
                    : 'Bu inshoda belgilangan xato topilmadi.'}
                </p>
                {annotations.length > 0 && (
                  <button
                    onClick={() => setActiveIdx(0)}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-800 transition-colors"
                  >
                    Birinchisidan boshlash
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Keyingi bandga chiqish rejasi ---------- */}
      {fb.next_band?.actions?.length > 0 && (
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center shrink-0">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">
                Band {fb.next_band.target} ga chiqish uchun
              </h3>
              <p className="text-xs text-gray-500">Keyingi insho yozishdan oldin shularga e'tibor bering</p>
            </div>
          </div>

          <ol className="space-y-3">
            {fb.next_band.actions.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-700 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ---------- Kuchli tomonlar ---------- */}
      {fb.strengths?.length > 0 && (
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-500" /> Nimani saqlab qolish kerak
          </h3>
          <ul className="space-y-2.5">
            {fb.strengths.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 leading-relaxed flex gap-2">
                <span className="text-green-500 shrink-0">•</span><span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ---------- Mavzu + ogohlantirish ---------- */}
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mavzu</p>
        <p className="text-xs text-gray-600 leading-relaxed mb-5">{result.prompt_text || prompt?.text}</p>
        {chart && (
          <div className="mb-5 rounded-xl border border-gray-100 p-3 sm:p-4">
            <Task1Chart chart={chart} />
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Bu <strong>taxminiy baho</strong> — sun'iy intellekt rasmiy band descriptor'lar
            asosida hisoblaydi, rasmiy IELTS ekspertining bahosi emas. Haqiqiy imtihon
            natijasi farq qilishi mumkin.
          </p>
        </div>
      </div>

      {/* ---------- Amallar ---------- */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button onClick={onNewEssay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-xs transition-colors">
          <RefreshCw className="w-4 h-4" /> Shu mavzuni qayta yozish
        </button>
        <button onClick={() => navigate('/writing-packs')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Boshqa to'plam
        </button>
      </div>
    </div>
  )
}
