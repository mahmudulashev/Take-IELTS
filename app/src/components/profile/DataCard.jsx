import React from 'react'
import { Cloud, CloudOff, Trash2 } from 'lucide-react'
import { isSupabaseConfigured } from '../../lib/supabase'

/** Bulutga saqlash holati va javoblar tarixini tozalash tugmasi. */
export default function DataCard({ onClear }) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-4">
      <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
        {isSupabaseConfigured ? <Cloud className="w-4 h-4 text-blue-500" /> : <CloudOff className="w-4 h-4 text-gray-400" />}
        <span>Bulut va Natijalar Boshqaruvi</span>
      </h3>

      <div className="text-xs text-gray-500 leading-relaxed">
        {isSupabaseConfigured
          ? 'Javoblaringiz va AI tahlili avtomatik tarzda bulutga saqlanadi — hech narsa bosishingiz shart emas.'
          : 'Hozircha `.env` faylida Supabase kalitlari belgilanmagan. Sozlaganingizdan so\'ng Google OAuth va bulut saqlash ishga tushadi.'}
      </div>

      <button
        onClick={onClear}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        <span>Javoblar Tarixini Tozalash</span>
      </button>
    </div>
  )
}
