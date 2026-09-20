import React, { useMemo, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import AnnotatedEssay, { typeMeta } from '../AnnotatedEssay'
import { CARD, LABEL } from './shared'

/**
 * Belgilangan javob va tanlangan xato paneli.
 *
 * Tanlov holati (qaysi belgi ochiq, qaysi tur bo'yicha filtr) shu yerda
 * turadi — undan tashqarida hech kimga kerak emas.
 */
export default function EssayPanel({ task, essay, annotations }) {
  const [activeIdx, setActiveIdx] = useState(null)
  const [filter, setFilter] = useState(null)

  const active = activeIdx != null ? annotations[activeIdx] : null

  // Xato turlari bo'yicha sanoq — filtr tugmalari uchun
  const counts = useMemo(() => {
    const c = {}
    annotations.forEach((a) => { c[a.type] = (c[a.type] || 0) + 1 })
    return c
  }, [annotations])

  return (
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
            essay={essay}
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
  )
}
