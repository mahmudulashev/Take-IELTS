import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnotatedEssay, { typeMeta, TYPE_META } from './AnnotatedEssay'
import {
  PenLine, RefreshCw, ArrowLeft, AlertTriangle, Target,
  ChevronRight, Sparkles, X,
} from 'lucide-react'

const CRITERIA = [
  { key: 'task_response',      field: 'band_task',      label: 'Task Response',     short: 'Mavzuga javob' },
  { key: 'coherence_cohesion', field: 'band_coherence', label: 'Coherence & Cohesion', short: 'Bog\'lanish' },
  { key: 'lexical_resource',   field: 'band_lexical',   label: 'Lexical Resource',  short: 'So\'z boyligi' },
  { key: 'grammatical_range',  field: 'band_grammar',   label: 'Grammatical Range', short: 'Grammatika' },
]

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

  return (
    <div className="space-y-6">

      {/* ---------- Sarlavha: boshqa sahifalar bilan bir xil uslub ---------- */}
      <div className="bg-white rounded-[24px] p-5 sm:p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
            <PenLine className="w-3.5 h-3.5" />
            <span>Writing Task 2 · Tahlil</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
            Inshoyingiz baholandi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {result.word_count} so'z · {annotations.length} ta belgilangan joy
            {typeof result.attemptsToday === 'number' && ` · bugun ${result.attemptsToday}/${result.dailyLimit}`}
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Umumiy</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-extrabold text-[#FF3131] leading-none">{overall ?? '—'}</span>
              <span className="text-sm font-bold text-gray-300">/9</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Mezonlar: gorizontal bar, Reports uslubida ---------- */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg mb-6">Mezonlar bo'yicha</h3>

        <div className="space-y-5">
          {CRITERIA.map((c) => {
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
      </div>

      {/* ---------- ASOSIY QISM: belgilangan insho ---------- */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-1">Inshoyingiz, xatolar belgilangan holda</h3>
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
          <RefreshCw className="w-4 h-4" /> Yangi insho yozish
        </button>
        <button onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
      </div>
    </div>
  )
}
