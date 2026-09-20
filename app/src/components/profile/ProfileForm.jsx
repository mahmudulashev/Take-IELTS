import React from 'react'
import { User, Save } from 'lucide-react'
import BandSelect from './BandSelect'
import ExamDatePicker from './ExamDatePicker'

/** Ism, maqsadli band va imtihon sanasi — bitta forma. */
export default function ProfileForm({
  fullName, onFullName,
  targetBand, onTargetBand,
  examDate, onExamDate,
  saving, onSubmit,
}) {
  return (
    <div className="w-full bg-white rounded-[24px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col">
      <h2 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-[#FF3131]" />
        <span>Shaxsiy Ma'lumotlarni Tahrirlash</span>
      </h2>

      <form onSubmit={onSubmit} className="space-y-6 flex-1 flex flex-col">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            To'liq Ismingiz
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => onFullName(e.target.value)}
              placeholder="Ismingiz va familiyangiz"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF3131] focus:ring-2 focus:ring-[#FF3131]/20 outline-none text-sm font-semibold text-gray-900 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BandSelect value={targetBand} onChange={onTargetBand} />
          <ExamDatePicker value={examDate} onChange={onExamDate} />
        </div>

        <div className="pt-2 mt-auto">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF3131] text-white font-bold text-xs hover:bg-[#E82C2C] transition-all shadow-md shadow-[#FF3131]/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
