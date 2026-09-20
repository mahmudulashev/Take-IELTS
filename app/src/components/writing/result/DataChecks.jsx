import React from 'react'
import { CARD, LABEL } from './shared'

/**
 * Task 1: AI javobdagi har bir raqam va solishtiruvchi da'voni grafik bilan
 * tekshiradi. Nimalar tekshirilgani ko'rinib tursin — ball nimaga
 * asoslanganini foydalanuvchi o'zi ko'ra olsin.
 */
export default function DataChecks({ checks }) {
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
