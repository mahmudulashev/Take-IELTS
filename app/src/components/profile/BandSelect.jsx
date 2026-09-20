import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useClickOutside } from './useClickOutside'

const BAND_OPTIONS = ['6.0', '6.5', '7.0', '7.5', '8.0', '8.5', '9.0']

/** Maqsadli band tanlash — brauzerning `select` i o'rniga o'z ro'yxati. */
export default function BandSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
        Maqsadli IELTS Balli
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 bg-white text-left flex items-center justify-between text-sm font-semibold text-gray-900 shadow-xs hover:border-gray-300 transition-all"
      >
        <span>Band {value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180 text-[#FF3131]' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-40 bg-white rounded-2xl border border-gray-100 shadow-xl p-2 space-y-1"
          >
            {BAND_OPTIONS.map((band) => (
              <button
                key={band}
                type="button"
                onClick={() => {
                  onChange(band)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  value === band
                    ? 'bg-[#FFF0F0] text-[#FF3131]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>Band {band}</span>
                {value === band && <Check className="w-4 h-4 text-[#FF3131]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
