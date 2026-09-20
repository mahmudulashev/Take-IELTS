import React from 'react'
import { Trash2 } from 'lucide-react'

/** Javoblar tarixini o'chirishni tasdiqlash oynasi. */
export default function ClearHistoryModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-2">Javoblar tarixini tozalash</h3>
        <p className="text-xs text-gray-500 mb-6">
          Task 1 va Task 2 bo'yicha yozilgan barcha javoblar, ularning matni va AI tahlili o'chirib tashlanadi. Bu amalni ortga qaytarib bo'lmaydi!
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-md shadow-red-600/20"
          >
            Ha, Barchasini O'chirish
          </button>
        </div>
      </div>
    </div>
  )
}
