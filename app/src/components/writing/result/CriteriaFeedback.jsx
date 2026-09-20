import React from 'react'
import { CARD, LABEL, num } from './shared'

/**
 * Har bir mezon uchun: ball, nega shunday, javobdan sitata va yarim ball
 * ko'tarish uchun aniq maslahat. Eng past mezon ajratib ko'rsatiladi.
 */
export default function CriteriaFeedback({ criteria, result, feedback, uneven, minBand, noun }) {
  return (
    <div className={`${CARD} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-6`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="text-[22px] font-semibold tracking-[-.01em]">Mezonlar bo'yicha izoh</span>
        <span className="text-sm text-[#6B7280]">Har bir mezon uchun sitata va +0.5 ga yo'l</span>
      </div>

      {criteria.map((c) => {
        const band = num(result[c.field])
        const detail = feedback.criteria_feedback?.[c.key]
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
  )
}
