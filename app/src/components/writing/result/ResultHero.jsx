import React, { useMemo, useId } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { TASK_CONFIG } from '../../../data/writing-prompts'
import { num, shortBand, bandLevel, isToday } from './shared'

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
export default function ResultHero({ result, task, criteria }) {
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
