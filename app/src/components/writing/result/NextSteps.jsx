import React from 'react'
import { CARD, LABEL } from './shared'

/** Keyingi bandga chiqish rejasi va saqlab qolish kerak bo'lgan kuchli tomonlar. */
export default function NextSteps({ nextBand, strengths }) {
  const actions = nextBand?.actions ?? []
  const wins = strengths ?? []
  if (!actions.length && !wins.length) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {actions.length > 0 && (
        <div className={`${CARD} ${wins.length ? '' : 'lg:col-span-2'} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5`}>
          <div className="flex flex-col gap-1">
            <span className={`${LABEL} text-[#C2242A]`}>Keyingi qadam</span>
            <span className="text-[22px] font-semibold tracking-[-.01em]">
              Band {nextBand.target} ga chiqish uchun
            </span>
          </div>
          <ol className="flex flex-col gap-3">
            {actions.map((a, i) => (
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

      {wins.length > 0 && (
        <div className={`${CARD} ${actions.length ? '' : 'lg:col-span-2'} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-5`}>
          <div className="flex flex-col gap-1">
            <span className={`${LABEL} text-[#1F7A48]`}>Kuchli tomonlar</span>
            <span className="text-[22px] font-semibold tracking-[-.01em]">Nimani saqlab qolish kerak</span>
          </div>
          <ul className="flex flex-col gap-3">
            {wins.map((s, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-[#3F4650] leading-normal">
                <span className="w-2 h-2 rounded-full bg-[#1F7A48] shrink-0 mt-2" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
