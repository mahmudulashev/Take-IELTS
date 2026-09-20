import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { UZBEK_MONTHS, formatExamDate } from '../../lib/format'
import { useClickOutside } from './useClickOutside'

const WEEK_DAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

const pad = (n) => String(n).padStart(2, '0')

/** Imtihon sanasi uchun o'zbekcha kalendar va tezkor tugmalar. */
export default function ExamDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  const start = new Date(value || Date.now())
  const [calMonth, setCalMonth] = useState(() => (isNaN(start) ? new Date().getMonth() : start.getMonth()))
  const [calYear, setCalYear] = useState(() => (isNaN(start) ? new Date().getFullYear() : start.getFullYear()))

  // Sana tashqaridan o'zgarsa (profil yuklandi yoki tezkor tugma bosildi) —
  // ko'rinib turgan oy ham o'sha sanaga ko'chadi.
  useEffect(() => {
    const d = new Date(value)
    if (value && !isNaN(d)) {
      setCalMonth(d.getMonth())
      setCalYear(d.getFullYear())
    }
  }, [value])

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7 // Monday = 0

  const selectDay = (day) => {
    onChange(`${calYear}-${pad(calMonth + 1)}-${pad(day)}`)
    setOpen(false)
  }

  const quickAddMonths = (monthsToAdd) => {
    const future = new Date()
    future.setMonth(future.getMonth() + monthsToAdd)
    onChange(`${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}`)
    setOpen(false)
  }

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(calYear - 1)
    } else {
      setCalMonth(calMonth - 1)
    }
  }

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(calYear + 1)
    } else {
      setCalMonth(calMonth + 1)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
        Kutilayotgan Imtihon Sanasi
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 bg-white text-left flex items-center justify-between text-sm font-semibold text-gray-900 shadow-xs hover:border-gray-300 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[#FF3131]" />
          <span>{formatExamDate(value)}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#FF3131]' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 left-0 sm:left-auto sm:w-80 top-full z-50 bg-white rounded-2xl border border-gray-100 shadow-2xl p-4 space-y-4 mt-1"
          >
            {/* Oy va yil boshqaruvi */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-xs text-gray-900">
                {UZBEK_MONTHS[calMonth]} {calYear}
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Hafta kunlari */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 uppercase">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Kunlar */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isSelected = value === `${calYear}-${pad(calMonth + 1)}-${pad(day)}`

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#FF3131] text-white shadow-md shadow-[#FF3131]/20 scale-105'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Tezkor tanlov */}
            <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-1.5">
              {[1, 2, 3, 6].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => quickAddMonths(months)}
                  className="py-1.5 px-2 rounded-lg bg-gray-50 hover:bg-[#FFF0F0] text-gray-600 hover:text-[#FF3131] text-[11px] font-bold transition-all text-center"
                >
                  +{months} oydan keyin
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
