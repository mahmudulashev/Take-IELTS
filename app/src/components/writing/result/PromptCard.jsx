import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Task1Chart from '../Task1Chart'
import { CARD, LABEL } from './shared'

/** Mavzu matni, Task 1 grafigi va bahoning taxminiyligi haqida ogohlantirish. */
export default function PromptCard({ text, chart }) {
  return (
    <div className={`${CARD} px-5 py-6 sm:px-[30px] sm:py-7 flex flex-col gap-4`}>
      <span className={`${LABEL} text-[#6B7280]`}>Mavzu</span>
      <p className="text-[15px] text-[#3F4650] leading-relaxed">{text}</p>
      {chart && (
        <div className="w-full max-w-[600px] rounded-2xl border border-[#EDEDF0] p-3 sm:p-4">
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
  )
}
