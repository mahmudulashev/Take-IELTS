import React from 'react'
import { CARD, LABEL } from './shared'

/** Umumiy xulosa va bir qarashda ko'rinadigan kuchli/zaif tomon. */
export default function SummaryCards({ summary, strongest, weakest, target, overall }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className={`${CARD} ${summary ? 'xl:col-span-2' : 'hidden'} min-w-0 px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-2.5`}>
        <span className={`${LABEL} text-[#C2242A]`}>Umumiy xulosa</span>
        <p className="text-[17px] sm:text-[19px] leading-[1.55] text-[#22262E]">{summary}</p>
      </div>
      <div className={`${CARD} ${summary ? '' : 'xl:col-span-3'} min-w-0 px-[26px] py-6 flex flex-col gap-3.5`}>
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
  )
}
