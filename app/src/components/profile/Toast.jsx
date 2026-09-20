import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

/** O'ng yuqorida chiqadigan qisqa xabar (saqlandi / xatolik). */
export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-8 right-8 z-50 p-4 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border max-w-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="leading-snug">{message.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
